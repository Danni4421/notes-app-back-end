/* eslint-disable comma-dangle */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // initializing new User
  pgm.sql(
    "INSERT INTO users (id, username, password, fullname) VALUES ('old_notes', 'old_notes', old_notes', 'old_notes')"
  );

  // changing value for owner that containt null value
  pgm.sql("UPDATE users SET owner = 'old_notes' WHERE owner IS NULL");

  // set constraint foreign key to owner attribute
  pgm.addConstraint(
    'notes',
    'fk_notes.owner_users.id',
    'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  // drop the constraint
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');

  // set owner to be null
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  // delete new user that have id 'old_notes'
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
