const fs = require('fs');
const util = require('util');
const express = require('express');
const path = require('path');
const readFromFile = util.promisify(fs.readFile);


const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) =>
    res.json(JSON.parse(data))
  );
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title: title,
      text: text,
      id: 0,
    };
    console.log(newNote);
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const notesArr = JSON.parse(data);
        newNote.id = notesArr.length;
        notesArr.push(newNote);
        fs.writeFile('./db/db.json', JSON.stringify(notesArr, null, 4), (err) =>
          err ? console.error(err) : console.info(`\nNotes written to ./db/db.json`)
        );
        res.json(`Note added successfully!`);
      }
    });
  } else {
    res.error('Error adding note!');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const noteID = req.params.id;
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      var notesArr = JSON.parse(data);
      console.log(notesArr, noteID);
      for (let i = 0; i < notesArr.length; i++) {
        if (notesArr[i].id == noteID && i > 0 && i < notesArr.length - 1) {
          notesArr.splice(i, 1);
          notesArr[i].id = i;
        } else if (notesArr.length === 1) {
          notesArr = [];
        } else if (i === notesArr.length - 1) {
          notesArr.pop();
        } else {
        notesArr[i].id = i;
        }
      }
      fs.writeFile('./db/db.json', JSON.stringify(notesArr, null, 4), (err) =>
      err ? console.error(err) : console.info(`\nNotes Deleted from ./db/db.json`)
      );
      res.json(`Note ${noteID} has been deleted!`);
    }
  });

});

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);