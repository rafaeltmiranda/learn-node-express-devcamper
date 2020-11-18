const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load modules
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        console.log('- Importing bootcamps...');
        await Bootcamp.create(bootcamps);
        console.log('- Importing courses...');
        await Course.create(courses);

        console.log('Data imported...'.green.bold);
        process.exit();
    } catch (err) {
        console.log('An error occurred:\n'.red.bold, err.stack);
        process.exit(1);
    }
}

// Delete data from DB
const deleteData = async () => {
    try {
        console.log('- Deleting bootcamps...');
        await Bootcamp.deleteMany();
        console.log('- Deleting courses...');
        await Course.deleteMany();

        console.log('All data was deleted...'.yellow.bold);
        process.exit();
    } catch (err) {
        console.log('An error occurred:\n'.red.bold, err.stack);
        process.exit(1);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
} else {
    console.log(`Option ${process.argv[2]} not available`.red);
    console.log('\nTry one of the bellow options:\n' +
        '\t-i to import data\n' +
        '\t-d to delete all data');
    process.exit(1);
}