const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelpCamp')
    .then(() => { console.log("connected"); })
    .catch(err => {
        console.log("Error connecting to database");
        console.log(err);
    });

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground(
            {
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                images: [
                    {
                        url: 'https://res.cloudinary.com/dqsojznwk/image/upload/v1750020858/YelpCamp/f9p48moxlbhw8xwy8px4.png',
                        filename: 'YelpCamp/f9p48moxlbhw8xwy8px4',
                    },
                    {
                        url: 'https://res.cloudinary.com/dqsojznwk/image/upload/v1750020858/YelpCamp/a6jaeythhwqeiccz8go9.png',
                        filename: 'YelpCamp/a6jaeythhwqeiccz8go9',
                    }
                ],
                title: `${sample(descriptors)}, ${sample(places)}`,
                description: "Nestled in the heart of the Blue Ridge Mountains, Camp Evergreen offers children ages 8–16 an unforgettable summer experience filled with adventure, creativity, and lasting friendships. From canoeing on our crystal-clear lake to evening campfires under the stars, every day is packed with exciting activities designed to build confidence and foster community.",
                price,
                author: '684caf70af255b07b2ffa11a',
                geometry: {
                    type: "Point",
                    coordinates: [cities[random1000].longitude, cities[random1000].latitude]
                },
            }
        )
        await camp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("seeds made");
});