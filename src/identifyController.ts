import { Request, Response } from 'express';
import { db } from './db';

export const identifyUser = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: 'Email or phoneNumber required' });

  try {
    const [rows] = await db.query(
      `SELECT * FROM Contact WHERE (email = ? OR phoneNumber = ?) AND deletedAt IS NULL ORDER BY createdAt ASC`,
      [email, phoneNumber]
    );
    const contacts = rows as any[];

    if (contacts.length === 0) {
      const [result] = await db.query(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES (?, ?, 'primary')`,
        [email, phoneNumber]
      );
      const newId = (result as any).insertId;
      return res.json({
        contact: {
          primaryContactId: newId,
          emails: [email].filter(Boolean),
          phoneNumbers: [phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      });
    }

    let primary = contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];

    for (const c of contacts) {
      if (c.linkPrecedence === 'primary' && c.id !== primary.id) {
        await db.query(
          `UPDATE Contact SET linkPrecedence = 'secondary', linkedId = ? WHERE id = ?`,
          [primary.id, c.id]
        );
      }
    }

    const alreadyExists = contacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
    if (!alreadyExists) {
      await db.query(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence, linkedId) VALUES (?, ?, 'secondary', ?)`,
        [email, phoneNumber, primary.id]
      );
    }

    const [allRelated] = await db.query(
      `SELECT * FROM Contact WHERE id = ? OR linkedId = ?`,
      [primary.id, primary.id]
    );
    const all = allRelated as any[];

    const emails = [...new Set(all.map(c => c.email).filter(Boolean))];
    const phones = [...new Set(all.map(c => c.phoneNumber).filter(Boolean))];
    const secondaries = all.filter(c => c.linkPrecedence === 'secondary').map(c => c.id);

    res.json({
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers: phones,
        secondaryContactIds: secondaries,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
