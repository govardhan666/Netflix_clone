const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const sampleContent = [
  {
    title: "The Digital Frontier",
    description: "A thrilling journey into the world of technology and artificial intelligence. Follow the story of a brilliant programmer who discovers a revolutionary AI.",
    type: "movie",
    genres: ["Action", "Sci-Fi", "Thriller"],
    releaseYear: 2023,
    duration: 142,
    maturityRating: "PG-13",
    thumbnail: "https://picsum.photos/seed/movie1/300/450",
    banner: "https://picsum.photos/seed/banner1/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "John Smith", role: "Lead Developer" },
      { name: "Sarah Johnson", role: "AI Researcher" }
    ],
    director: "Michael Chen",
    tags: ["technology", "future", "ai"],
    rating: { average: 8.5, count: 1250 },
    popularity: 95,
    featured: true,
    trending: true,
    newRelease: true,
    viewCount: 45000
  },
  {
    title: "Chronicles of Tomorrow",
    description: "An epic series spanning multiple timelines. Watch as heroes from different eras unite to save humanity from an ancient threat.",
    type: "series",
    genres: ["Fantasy", "Adventure", "Drama"],
    releaseYear: 2022,
    maturityRating: "TV-14",
    thumbnail: "https://picsum.photos/seed/series1/300/450",
    banner: "https://picsum.photos/seed/banner2/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Emma Watson", role: "The Guardian" },
      { name: "Chris Hemsworth", role: "The Warrior" }
    ],
    director: "Jennifer Lee",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "The Beginning",
            description: "The journey starts with an unexpected discovery.",
            duration: 52,
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            thumbnail: "https://picsum.photos/seed/ep1/300/169"
          },
          {
            episodeNumber: 2,
            title: "Rising Tensions",
            description: "Ancient secrets come to light.",
            duration: 48,
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            thumbnail: "https://picsum.photos/seed/ep2/300/169"
          }
        ]
      }
    ],
    tags: ["epic", "fantasy", "adventure"],
    rating: { average: 9.2, count: 3450 },
    popularity: 98,
    featured: true,
    trending: true,
    viewCount: 125000
  },
  {
    title: "Laugh Out Loud",
    description: "A hilarious comedy about a group of friends navigating life in the big city. Expect the unexpected!",
    type: "movie",
    genres: ["Comedy", "Romance"],
    releaseYear: 2023,
    duration: 98,
    maturityRating: "PG-13",
    thumbnail: "https://picsum.photos/seed/comedy1/300/450",
    banner: "https://picsum.photos/seed/banner3/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Kevin Hart", role: "Mike" },
      { name: "Amy Poehler", role: "Sarah" }
    ],
    director: "Judd Apatow",
    tags: ["funny", "romantic", "feel-good"],
    rating: { average: 7.8, count: 890 },
    popularity: 82,
    trending: false,
    newRelease: true,
    viewCount: 23000
  },
  {
    title: "Mystery Manor",
    description: "A detective series filled with twists and turns. Every episode brings a new mystery to solve in the haunted mansion.",
    type: "series",
    genres: ["Mystery", "Thriller", "Drama"],
    releaseYear: 2021,
    maturityRating: "TV-MA",
    thumbnail: "https://picsum.photos/seed/mystery1/300/450",
    banner: "https://picsum.photos/seed/banner4/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Benedict Cumberbatch", role: "Detective Holmes" },
      { name: "Viola Davis", role: "Inspector Watson" }
    ],
    director: "David Fincher",
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: "The First Clue",
            description: "A mysterious letter arrives at the manor.",
            duration: 45,
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            thumbnail: "https://picsum.photos/seed/mystery_ep1/300/169"
          }
        ]
      }
    ],
    tags: ["detective", "suspense", "mystery"],
    rating: { average: 8.9, count: 2100 },
    popularity: 88,
    featured: false,
    trending: true,
    viewCount: 67000
  },
  {
    title: "Action Heroes United",
    description: "The ultimate action movie. When the world is threatened, the greatest heroes must unite.",
    type: "movie",
    genres: ["Action", "Adventure"],
    releaseYear: 2023,
    duration: 135,
    maturityRating: "PG-13",
    thumbnail: "https://picsum.photos/seed/action1/300/450",
    banner: "https://picsum.photos/seed/banner5/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Dwayne Johnson", role: "Commander Stone" },
      { name: "Scarlett Johansson", role: "Agent Black" }
    ],
    director: "James Cameron",
    tags: ["explosive", "heroes", "epic"],
    rating: { average: 8.2, count: 1890 },
    popularity: 91,
    featured: true,
    trending: false,
    newRelease: true,
    viewCount: 78000
  },
  {
    title: "Love in Paris",
    description: "A romantic tale set in the city of lights. Two strangers meet and discover that love knows no boundaries.",
    type: "movie",
    genres: ["Romance", "Drama"],
    releaseYear: 2022,
    duration: 108,
    maturityRating: "PG",
    thumbnail: "https://picsum.photos/seed/romance1/300/450",
    banner: "https://picsum.photos/seed/banner6/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Ryan Gosling", role: "Pierre" },
      { name: "Emma Stone", role: "Sophie" }
    ],
    director: "Sofia Coppola",
    tags: ["romantic", "paris", "heartfelt"],
    rating: { average: 7.6, count: 1120 },
    popularity: 75,
    featured: false,
    trending: false,
    newRelease: false,
    viewCount: 34000
  },
  {
    title: "Space Odyssey 2099",
    description: "Humanity's first mission to deep space encounters the unknown. A sci-fi epic that redefines the genre.",
    type: "movie",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    releaseYear: 2023,
    duration: 156,
    maturityRating: "PG-13",
    thumbnail: "https://picsum.photos/seed/scifi1/300/450",
    banner: "https://picsum.photos/seed/banner7/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Matthew McConaughey", role: "Captain Brooks" },
      { name: "Anne Hathaway", role: "Dr. Brand" }
    ],
    director: "Christopher Nolan",
    tags: ["space", "exploration", "future"],
    rating: { average: 9.1, count: 4200 },
    popularity: 97,
    featured: true,
    trending: true,
    newRelease: true,
    viewCount: 156000
  },
  {
    title: "Horror House",
    description: "Enter if you dare. A group of friends spend a night in a haunted house and face their worst nightmares.",
    type: "movie",
    genres: ["Horror", "Thriller"],
    releaseYear: 2022,
    duration: 92,
    maturityRating: "R",
    thumbnail: "https://picsum.photos/seed/horror1/300/450",
    banner: "https://picsum.photos/seed/banner8/1920/1080",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    trailerUrl: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
    cast: [
      { name: "Vera Farmiga", role: "Emily" },
      { name: "Patrick Wilson", role: "David" }
    ],
    director: "James Wan",
    tags: ["scary", "supernatural", "haunted"],
    rating: { average: 7.3, count: 980 },
    popularity: 71,
    featured: false,
    trending: false,
    newRelease: false,
    viewCount: 28000
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix_clone', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Clear existing content
    await Content.deleteMany({});
    console.log('Cleared existing content');

    // Insert sample content
    await Content.insertMany(sampleContent);
    console.log(`Inserted ${sampleContent.length} content items`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
