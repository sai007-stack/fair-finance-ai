-- Change user_id in appeals table from UUID to TEXT to store user names
ALTER TABLE appeals ALTER COLUMN user_id TYPE text USING user_id::text;

-- Change user_id in notifications table from UUID to TEXT to store user names
ALTER TABLE notifications ALTER COLUMN user_id TYPE text USING user_id::text;