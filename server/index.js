const express = require('express');
const bodyParser = requore('body-parser');
const PORT = process.env.PORT || 8080;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/../react-client/dist`));

app.get('*', (rec, res) => {
	res.sendFile(path.resolve(`${__dirname}/../react-client/dist/index.html`));
});

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}!`);
});