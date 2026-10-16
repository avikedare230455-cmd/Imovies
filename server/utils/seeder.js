const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateDefaultSeats } = require('../controllers/showController');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Movie.deleteMany(),
      Theatre.deleteMany(),
      Show.deleteMany(),
      Booking.deleteMany(),
      Payment.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('[Seeder] Cleared previous data');

    // 1. Create Users (User pre('save') hook will hash password automatically)
    const [adminUser, normalUser] = await User.create([
      {
        name: 'Avi Kedare',
        email: 'admin@imovies.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 7049665286',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Raj Patel',
        email: 'user@imovies.com',
        password: 'user123',
        role: 'user',
        phone: '+91 9876543210',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ]);

    console.log('[Seeder] Created default Admin (admin@imovies.com / admin123) and User (user@imovies.com / user123)');

    // 2. Create Blockbuster Movies
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        poster: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
        banner: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genres: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
        languages: ['English', 'Spanish', 'French'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 8.8,
        votesCount: 42300,
        certificate: 'PG-13',
        director: 'Denis Villeneuve',
        featured: true,
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zendaya', role: 'Chani', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral paradoxes of devastating scientific breakthrough.',
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        banner: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genres: ['Biography', 'Drama', 'History'],
        languages: ['English', 'German'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        votesCount: 65100,
        certificate: 'R',
        director: 'Christopher Nolan',
        featured: true,
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        banner: 'https://image.tmdb.org/t/p/original/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        languages: ['English'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        rating: 8.7,
        votesCount: 98000,
        certificate: 'PG-13',
        director: 'Christopher Nolan',
        featured: true,
        cast: [
          { name: 'Matthew McConaughey', role: 'Joseph Cooper', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
          { name: 'Anne Hathaway', role: 'Dr. Amelia Brand', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        banner: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
        languages: ['English', 'Spanish'],
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        rating: 8.7,
        votesCount: 51200,
        certificate: 'PG',
        director: 'Joaquim Dos Santos, Kemp Powers',
        featured: false,
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        banner: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['English'],
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        rating: 9.0,
        votesCount: 125000,
        certificate: 'PG-13',
        director: 'Christopher Nolan',
        featured: false,
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Heath Ledger', role: 'Joker', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        banner: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genres: ['Action', 'Adventure', 'Drama'],
        languages: ['English', 'Italian'],
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        rating: 8.4,
        votesCount: 22400,
        certificate: 'R',
        director: 'Ridley Scott',
        featured: false,
        cast: [
          { name: 'Paul Mescal', role: 'Lucius Verus', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
          { name: 'Pedro Pascal', role: 'Marcus Acacius', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Denzel Washington', role: 'Macrinus', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Spider-Man: Brand New Day',
        description: 'Peter Parker embraces a fresh start swinging through the skyline of New York City. Operating as an independent hero without high-tech crutches, he must confront new street-level threats and personal sacrifices to protect his neighborhood and keep his promise.',
        poster: 'https://image.tmdb.org/t/p/w500/yyB2VJEW3an2xCdcYCPQhn9QERR.jpg',
        banner: 'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
        genres: ['Action', 'Sci-Fi', 'Adventure'],
        languages: ['English', 'Spanish'],
        duration: 145,
        releaseDate: new Date('2026-07-31'),
        rating: 9.1,
        votesCount: 48900,
        certificate: 'PG-13',
        director: 'Destin Daniel Cretton',
        featured: true,
        cast: [
          { name: 'Tom Holland', role: 'Peter Parker / Spider-Man', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zendaya', role: 'MJ Watson', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Jon Bernthal', role: 'Frank Castle / Punisher', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine on an irreverent multiversal mission.',
        poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        banner: 'https://image.tmdb.org/t/p/original/cOoVcVQ3i1m5b2xtqKBtoTSbxC1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        languages: ['English'],
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        rating: 8.8,
        votesCount: 94000,
        certificate: 'R',
        director: 'Shawn Levy',
        featured: true,
        cast: [
          { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Hugh Jackman', role: 'Logan / Wolverine', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Emma Corrin', role: 'Cassandra Nova', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'The Batman',
        description: 'When a sadistic serial killer known as the Riddler begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
        poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        banner: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
        genres: ['Action', 'Crime', 'Drama', 'Mystery'],
        languages: ['English'],
        duration: 176,
        releaseDate: new Date('2022-03-04'),
        rating: 8.9,
        votesCount: 42100,
        certificate: 'PG-13',
        director: 'Matt Reeves',
        featured: false,
        cast: [
          { name: 'Robert Pattinson', role: 'Bruce Wayne / Batman', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zoë Kravitz', role: 'Selina Kyle / Catwoman', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Colin Farrell', role: 'Oz Cobb / The Penguin', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        banner: 'https://image.tmdb.org/t/p/original/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        genres: ['Action', 'Sci-Fi', 'Adventure', 'Drama'],
        languages: ['English'],
        duration: 181,
        releaseDate: new Date('2019-04-26'),
        rating: 9.0,
        votesCount: 96000,
        certificate: 'PG-13',
        director: 'Anthony and Joe Russo',
        featured: true,
        cast: [
          { name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Chris Evans', role: 'Steve Rogers / Captain America', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Chris Hemsworth', role: 'Thor Odinson', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Mission: Impossible - Dead Reckoning',
        description: 'Ethan Hunt and his IMF team embark on their most dangerous mission yet: tracking down a terrifying rogue artificial intelligence known as the Entity before it falls into the wrong hands and alters global balance forever.',
        poster: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
        banner: 'https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=NOhDyHNwvqc',
        genres: ['Action', 'Adventure', 'Thriller'],
        languages: ['English', 'French', 'Italian'],
        duration: 163,
        releaseDate: new Date('2023-07-12'),
        rating: 8.7,
        votesCount: 35000,
        certificate: 'PG-13',
        director: 'Christopher McQuarrie',
        featured: false,
        cast: [
          { name: 'Tom Cruise', role: 'Ethan Hunt', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Hayley Atwell', role: 'Grace', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Simon Pegg', role: 'Benji Dunn', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'RRR',
        description: 'A fearless revolutionary and an officer in the British force, who once were friends, decide to join forces to chart out an inspirational path of freedom against the despotic British rulers.',
        poster: 'https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQWtwZMOW44EJ.jpg',
        banner: 'https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=GY4BgdUSpbE',
        genres: ['Action', 'Drama', 'Adventure'],
        languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
        duration: 187,
        releaseDate: new Date('2022-03-25'),
        rating: 8.8,
        votesCount: 92000,
        certificate: 'PG-13',
        director: 'S.S. Rajamouli',
        featured: true,
        cast: [
          { name: 'N.T. Rama Rao Jr.', role: 'Komaram Bheem', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Ram Charan', role: 'Alluri Sitarama Raju', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Alia Bhatt', role: 'Sita', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Kalki 2898 AD',
        description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a dystopian post-apocalyptic future.',
        poster: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
        banner: 'https://image.tmdb.org/t/p/original/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        rating: 8.6,
        votesCount: 78000,
        certificate: 'PG-13',
        director: 'Nag Ashwin',
        featured: true,
        cast: [
          { name: 'Prabhas', role: 'Bhairava', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Deepika Padukone', role: 'SUM-80', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Stree 2',
        description: 'After the events of Stree, the town of Chanderi is being haunted again. This time women are mysteriously abducted by a terrifying headless entity named Sarkata. Vicky and his friends must team up with the mysterious woman to save their town.',
        poster: 'https://image.tmdb.org/t/p/w500/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
        banner: 'https://image.tmdb.org/t/p/original/3AfHD1HoaQpQwKH8kxRdBKVmzeU.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=KVn5iZwhqL8',
        genres: ['Comedy', 'Horror', 'Mystery'],
        languages: ['Hindi'],
        duration: 147,
        releaseDate: new Date('2024-08-15'),
        rating: 8.5,
        votesCount: 64000,
        certificate: 'PG-13',
        director: 'Amar Kaushik',
        featured: true,
        cast: [
          { name: 'Rajkummar Rao', role: 'Vicky', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Shraddha Kapoor', role: 'She / Stree', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Pankaj Tripathi', role: 'Rudra', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Pathaan',
        description: 'An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target his homeland in this high-octane espionage action thriller from the YRF Spy Universe.',
        poster: 'https://image.tmdb.org/t/p/w500/hdMocMVapAfojnjupDGQHWPCCXr.jpg',
        banner: 'https://image.tmdb.org/t/p/original/9wRAIQeOv2qzcgpfvA4dYZKeezl.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=vqu4z34wENw',
        genres: ['Action', 'Thriller', 'Adventure'],
        languages: ['Hindi', 'Telugu', 'Tamil'],
        duration: 146,
        releaseDate: new Date('2023-01-25'),
        rating: 8.4,
        votesCount: 58000,
        certificate: 'PG-13',
        director: 'Siddharth Anand',
        featured: false,
        cast: [
          { name: 'Shah Rukh Khan', role: 'Pathaan', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Deepika Padukone', role: 'Rubina Mohsin', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'John Abraham', role: 'Jim', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'K.G.F: Chapter 2',
        description: 'The blood-soaked land of Kolar Gold Fields has a new overlord now - Rocky, whose name strikes fear into the heart of his foes. As the government and underworld conspire for his downfall, bloodier battles await Rocky on his quest for unchallenged supremacy.',
        poster: 'https://image.tmdb.org/t/p/w500/khNVygolU0TxLIDWff5tQlAhZ23.jpg',
        banner: 'https://image.tmdb.org/t/p/original/nsV5Mfi9FAV4w8eDsdr7uqVswOk.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=JKa05nyUmuQ',
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'],
        duration: 168,
        releaseDate: new Date('2022-04-14'),
        rating: 8.7,
        votesCount: 88000,
        certificate: 'PG-13',
        director: 'Prashanth Neel',
        featured: false,
        cast: [
          { name: 'Yash', role: 'Raja Krishnappa Bairya / Rocky', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Sanjay Dutt', role: 'Adheera', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Raveena Tandon', role: 'Ramika Sen', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Pushpa: The Rise',
        description: 'Pushpa Raj is a coolie who rises in the criminal syndicate of red sanders smuggling, an illegal market flourishing in the Seshachalam Hills of Rayalaseema in Andhra Pradesh.',
        poster: 'https://image.tmdb.org/t/p/w500/4DpNRjV7ITZ1GzCvrvCk86th0w.jpg',
        banner: 'https://image.tmdb.org/t/p/original/jQIcn51nsvMrpB9NFwEOb9QHhFt.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=pKctjlpbqpQ',
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
        duration: 179,
        releaseDate: new Date('2021-12-17'),
        rating: 8.6,
        votesCount: 74000,
        certificate: 'PG-13',
        director: 'Sukumar',
        featured: false,
        cast: [
          { name: 'Allu Arjun', role: 'Pushpa Raj', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Rashmika Mandanna', role: 'Srivalli', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Fahadh Faasil', role: 'Bhanwar Singh Shekhawat', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: 'Leo',
        description: 'Parthiban is a mild-mannered cafe owner in Theog who becomes a local hero through an act of violence, which inadvertently draws the attention of a drug cartel that suspects him of being their estranged former enforcer, Leo Das.',
        poster: 'https://image.tmdb.org/t/p/w500/2XUHC4lp3tDsgfFLFygNZ2x2Um9.jpg',
        banner: 'https://image.tmdb.org/t/p/original/zXuGXX6IjWRVjHQqMaxaobqzD8O.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Po3jStA673E',
        genres: ['Action', 'Crime', 'Thriller'],
        languages: ['Tamil', 'Telugu', 'Hindi', 'Malayalam'],
        duration: 164,
        releaseDate: new Date('2023-10-19'),
        rating: 8.3,
        votesCount: 52000,
        certificate: 'R',
        director: 'Lokesh Kanagaraj',
        featured: false,
        cast: [
          { name: 'Vijay', role: 'Parthiban / Leo Das', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Sanjay Dutt', role: 'Antony Das', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Trisha Krishnan', role: 'Sathya', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
      },
      {
        title: '3 Idiots',
        description: 'Two friends embark on a quest for a lost buddy. On this journey, they reminisce about their college days with their friend Rancho who inspired them to think differently, and uncover what happened to him.',
        poster: 'https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg',
        banner: 'https://image.tmdb.org/t/p/original/u7kuUaySqXBVAtqEl9vkTkAzHV9.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=K0eDlFX9GMc',
        genres: ['Comedy', 'Drama'],
        languages: ['Hindi'],
        duration: 170,
        releaseDate: new Date('2009-12-25'),
        rating: 9.1,
        votesCount: 110000,
        certificate: 'PG-13',
        director: 'Rajkumar Hirani',
        featured: true,
        cast: [
          { name: 'Aamir Khan', role: 'Rancho / Phunsukh Wangdu', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Kareena Kapoor', role: 'Pia Sahastrabuddhe', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'R. Madhavan', role: 'Farhan Qureshi', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
        ],
      },
    ]);
    console.log(`[Seeder] Created ${movies.length} blockbuster movies`);

    // 3. Create Premium Theatres
    const theatres = await Theatre.create([
      {
        name: 'IMAX Royale Grand Plaza',
        city: 'New York',
        address: '1540 Broadway, Times Square, New York, NY 10036',
        amenities: ['IMAX 70mm Dual Laser', 'Dolby Atmos 128-channel', 'Ultra VIP Recliners', 'Gourmet Bar & Cafe', 'Valet Parking'],
        rating: 4.9,
        phone: '+1 (212) 555-4629',
        screens: [
          { name: 'Auditorium 1 (IMAX Laser)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Auditorium 2 (Dolby Atmos)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'Dolby Cinema Sunset Boulevard',
        city: 'Los Angeles',
        address: '6801 Hollywood Blvd, Los Angeles, CA 90028',
        amenities: ['Dolby Vision & Atmos', 'Motorized Leather Recliners', 'Full Dine-in Cinema', 'Private Lounge', 'Self-Serve Kiosks'],
        rating: 4.8,
        phone: '+1 (323) 555-9831',
        screens: [
          { name: 'Screen A (Prime Dolby)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Screen B (VIP Club)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'Odeon Luxe Leicester Square',
        city: 'London',
        address: '24-26 Leicester Square, London WC2H 7LQ, UK',
        amenities: ['Dolby Cinema', 'Oscar Bar & Lounge', 'Luxury Heated Recliners', 'Laser Projection', 'Wheelchair Access'],
        rating: 4.8,
        phone: '+44 20 7555 0192',
        screens: [
          { name: 'Screen 1 (The Glass Room)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'PVR Superplex City Centre',
        city: 'Mumbai',
        address: 'Phoenix Palladium, Lower Parel, Mumbai, Maharashtra 400013',
        amenities: ['IMAX 3D', '4DX Sensory Seats', 'Gold Class Dine-In', 'Gourmet Popcorn Bar'],
        rating: 4.7,
        phone: '+91 22 5555 4010',
        screens: [
          { name: 'Audi 1 (IMAX 3D)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Audi 2 (4DX Motion)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'INOX Megaplex Inorbit Mall',
        city: 'Hyderabad',
        address: 'Inorbit Mall, Hitech City, Madhapur, Hyderabad, Telangana 500081',
        amenities: ['IMAX Laser', 'Insignia Luxury Lounges', 'Dolby Atmos', 'Live Kitchen'],
        rating: 4.8,
        phone: '+91 40 5555 9021',
        screens: [
          { name: 'Screen 1 (IMAX Laser)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Screen 2 (Insignia VIP)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'PVR Directors Cut Forum Rex Walk',
        city: 'Bengaluru',
        address: 'Rex Walk, Brigade Rd, Shanthala Nagar, Bengaluru, Karnataka 560001',
        amenities: ['Directors Cut Plush Recliners', 'Dedicated Butler Service', 'Dolby Atmos', 'Signature Patisserie'],
        rating: 4.9,
        phone: '+91 80 5555 3180',
        screens: [
          { name: 'Salon 1 (Platinum)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Salon 2 (Gold)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
      {
        name: 'SPI Palazzo Cinemas Nexus Vijaya',
        city: 'Chennai',
        address: 'Nexus Vijaya Mall, Arcot Rd, Vadapalani, Chennai, Tamil Nadu 600026',
        amenities: ['IMAX', 'RDX 4K Projection', 'Dolby Atmos', 'Signature SPI Popcorn'],
        rating: 4.8,
        phone: '+91 44 5555 7720',
        screens: [
          { name: 'Screen 1 (IMAX)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
          { name: 'Screen 2 (RDX Dolby)', totalSeats: 70, rows: 7, seatsPerRow: 10 },
        ],
      },
    ]);
    console.log(`[Seeder] Created ${theatres.length} luxury theatres across NYC, LA, London, Mumbai, Hyderabad, Bengaluru, and Chennai`);

    // 4. Generate Dates for Shows (Today, Tomorrow, Day after, etc.)
    const dateStrings = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dateStrings.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
    }

    const showTimes = ['10:30 AM', '02:00 PM', '06:15 PM', '09:45 PM'];

    // 5. Create Shows with 70 seats each
    const showsToInsert = [];

    // Distribute shows across movies and theatres
    for (const movie of movies) {
      // Pick suitable theatres: for Indian movies prioritize Indian cities
      const isIndianMovie = movie.languages.some(l => ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].includes(l));
      const targetTheatres = isIndianMovie 
        ? theatres.filter(t => ['Mumbai', 'Hyderabad', 'Bengaluru', 'Chennai', 'New York'].includes(t.city))
        : theatres.slice(0, 4);

      for (const theatre of targetTheatres) {
        for (const date of dateStrings.slice(0, 3)) { // 3 days of shows
          for (const time of showTimes.slice(0, 2)) { // 2 showtimes per day
            const priceTiers = { vip: 24, premium: 18, standard: 13 };
            const seats = generateDefaultSeats(priceTiers);

            // Pre-book 2-3 seats for realism
            seats[3].status = 'booked';
            seats[4].status = 'booked';
            seats[12].status = 'booked';

            showsToInsert.push({
              movie: movie._id,
              theatre: theatre._id,
              screenName: theatre.screens[0]?.name || 'Main Hall',
              date,
              startTime: time,
              priceTiers,
              seats,
              totalSeats: 70,
              availableSeatsCount: 67,
              format: movie.title.includes('Spider') || movie.title.includes('Kalki') || movie.title.includes('Avatar') ? '3D' : 'IMAX 3D',
              language: movie.languages[0] || 'English',
            });
          }
        }
      }
    }

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`[Seeder] Generated ${insertedShows.length} scheduled shows with full interactive seat maps`);

    // 6. Create Initial Sample Booking for Normal User
    const sampleShow = insertedShows[0];
    const sampleMovie = movies.find((m) => m._id.toString() === sampleShow.movie.toString());
    const sampleTheatre = theatres.find((t) => t._id.toString() === sampleShow.theatre.toString());

    const initialBooking = await Booking.create({
      bookingId: 'IMV-784912',
      user: normalUser._id,
      show: sampleShow._id,
      movie: {
        id: sampleMovie._id,
        title: sampleMovie.title,
        poster: sampleMovie.poster,
        certificate: sampleMovie.certificate,
        duration: sampleMovie.duration,
        format: sampleShow.format,
        language: 'English',
      },
      theatre: {
        id: sampleTheatre._id,
        name: sampleTheatre.name,
        city: sampleTheatre.city,
        address: sampleTheatre.address,
        screenName: sampleShow.screenName,
      },
      showDetails: {
        date: sampleShow.date,
        startTime: sampleShow.startTime,
      },
      seats: [
        { seatNumber: 'C4', tier: 'Premium', price: 18 },
        { seatNumber: 'C5', tier: 'Premium', price: 18 },
      ],
      ticketCount: 2,
      subtotal: 36,
      convenienceFee: 3.0,
      tax: 2.88,
      discount: 0,
      totalAmount: 41.88,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      paymentId: 'TXN-984214-5510',
      paymentMethod: 'Credit Card',
      qrData: JSON.stringify({
        bookingId: 'IMV-784912',
        movie: sampleMovie.title,
        theatre: sampleTheatre.name,
        seats: ['C4', 'C5'],
        showTime: `${sampleShow.date} ${sampleShow.startTime}`,
      }),
    });

    // Create corresponding payment
    await Payment.create({
      transactionId: 'TXN-984214-5510',
      booking: initialBooking._id,
      user: normalUser._id,
      amount: 41.88,
      paymentMethod: 'Credit Card',
      status: 'success',
      cardLast4: '4242',
    });

    // Notification for user
    await Notification.create({
      user: normalUser._id,
      title: 'Welcome to IMovies! 🎬',
      message: 'Your account is ready! Explore blockbuster movies, select premium seats, and enjoy cinematic excellence.',
      type: 'system',
    });

    console.log('[Seeder] Seed data successfully populated!');
    console.log('----------------------------------------------------');
    console.log('Login credentials:');
    console.log('  Admin : admin@imovies.com / admin123');
    console.log('  User  : user@imovies.com  / user123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
