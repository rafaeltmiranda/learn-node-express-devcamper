const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load modules
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
});



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        console.log('- Importing users...');
        await User.create(users);

        await sleep(300);

        console.log('- Importing bootcamps...');
        await Bootcamp.create(bootcamps);

        await sleep(300);

        console.log('- Importing courses...');
        await Course.create(courses);

        await sleep(700);

        console.log('- Importing reviews...');
        await Review.create(reviews);

        await sleep(700);

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
        console.log('- Deleting reviews...');
        await Review.deleteMany();

        await sleep(300);

        console.log('- Deleting courses...');
        await Course.deleteMany();

        await sleep(300);

        console.log('- Deleting bootcamps...');
        await Bootcamp.deleteMany()

        await sleep(700);

        console.log('- Deleting users...');
        await User.deleteMany();

        await sleep(700);

        console.log('Data deleted...'.yellow.bold);
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
    console.error(`Option ${process.argv[2]} not available`.red);
    console.log('\nTry one of the options bellow:\n' +
        '\t-i to import data\n' +
        '\t-d to delete all data');
    process.exit(1);
}