import express from 'express';
import { protect } from '../middleware/authMiddleware';

// Sample path data (to be replaced with actual DB fetching)
const samplePaths = [
  {
    id: 'solana-foundations',
    title: 'Solana Explorer Path',
    description: 'Learn the basics of Solana blockchain and explore its ecosystem.',
    questCount: 7,
    difficulty: 'Beginner',
    featured: true,
    graphicType: 'image',
    imageUrl: '/solana_v2_2b.jpg',
    totalXp: 1650
  },
  {
    id: 'layerzero-path',
    title: 'LayerZero Learning Path',
    description: 'Explore omnichain interactions! Start by funding your Devnet wallet, then dive into sending messages and tokens across blockchains with LayerZero V2.',
    questCount: 5,
    difficulty: 'Intermediate',
    featured: true,
    graphicType: 'image',
    imageUrl: '/layerzero.jpg',
    totalXp: 1500
  },
  {
    id: 'solquest-og',
    title: 'SolQuest OG Path',
    description: "Become a SolQuest OG by completing these community quests.",
    questCount: 5, 
    difficulty: 'Beginner',
    featured: true,
    graphicType: 'image',
    imageUrl: '/Union.svg',
    totalXp: 450
  },
  {
    id: 'zk-compression-path',
    title: 'ZK Compression Innovators Path',
    description: "Learn about ZK Compression on Solana. Discover how to build scalable, private, and secure applications using compressed tokens and accounts.",
    questCount: 7,
    difficulty: 'Advanced',
    featured: false,
    graphicType: 'image',
    imageUrl: '/zk-compression.jpg',
    totalXp: 1000
  }
];

const router = express.Router();

/**
 * @route   GET /api/paths
 * @desc    Get all learning paths
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with DB query
    return res.json(samplePaths);
  } catch (error) {
    console.error('Error in GET /paths:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/paths/featured
 * @desc    Get featured learning paths
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    // TODO: Replace with DB query with featured filter
    const featuredPaths = samplePaths.filter(path => path.featured);
    return res.json(featuredPaths);
  } catch (error) {
    console.error('Error in GET /paths/featured:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/paths/:id
 * @desc    Get a specific learning path by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const path = samplePaths.find(p => p.id === id);
    
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    return res.json(path);
  } catch (error) {
    console.error(`Error in GET /paths/${req.params.id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 