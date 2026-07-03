const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BlogPost = require('../models/BlogPost');

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration for blog cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all blogs
router.get('/', async (req, res) => {
  try {
    let posts = await BlogPost.find().sort({ createdAt: -1 });

    // Seed defaults if empty
    if (posts.length === 0) {
      const defaults = [
        {
          title: 'Exosomes for Hair Loss: Is This the Future of Hair Restoration?',
          slug: 'exosomes-for-hair-loss-is-this-the-future-of-hair-restoration',
          summary: 'Exosomes for Hair Loss: Is This the Future of Hair Restoration? Hair loss affects millions of men and women worldwide, often impacting confidence, appearance, and overall well-being. While treatments like PRP...',
          content: `Hair loss affects millions of men and women worldwide, often impacting confidence, appearance, and overall well-being. While treatments like PRP (Platelet-Rich Plasma), medications, and hair transplantation have helped many patients achieve noticeable results, advances in regenerative medicine are opening new possibilities.

One of the most exciting innovations in hair restoration today is Exosome Therapy for Hair Loss.

At Skin Savvy by Dr. Megha (DermElixir), we continuously evaluate the latest advancements in dermatology and hair restoration to provide our patients with safe, evidence-based treatment options. Exosome therapy has emerged as a promising non-surgical solution for individuals experiencing hair thinning, early-stage baldness, and poor hair quality.

What exactly are exosomes, and could they represent the future of hair restoration? Let's explore.

### What are Exosomes?
Exosomes are tiny extracellular vesicles, or microscopic bubbles, released by cells—particularly stem cells. They act as microscopic messengers, carrying essential biomolecules like proteins, growth factors, lipids, and nucleic acids from cell to cell. Unlike stem cells themselves, exosomes do not replicate or pose a risk of rejection, making them an extremely safe therapeutic option.

### How Exosomes Target Hair Loss
When injected or applied to the scalp, exosomes target hair follicles by delivering signals that trigger growth and cellular repair.
1. **Extending the Anagen (Growth) Phase**: Hair follicles go through growth, regression, and resting cycles. Exosomes push follicles out of the resting phase and back into active growth.
2. **Promoting Angiogenesis**: They stimulate new blood vessels in the scalp, increasing oxygen and nutrients to follicles.
3. **Reducing Inflammation**: Inflammatory conditions are a key cause of alopecia; exosomes have natural anti-inflammatory components.
4. **Rescuing Shrinking Follicles**: They reverse miniaturization, restoring thin, fine hair back to thicker, healthier shafts.`,
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
          category: 'Hair Restoration',
          author: 'Appointment Booking',
          dateString: '17 Jun'
        },
        {
          title: 'Why Hydrafacial Is One of the Best Summer Treatments',
          slug: 'why-hydrafacial-is-one-of-the-best-summer-treatments',
          summary: 'Why Hydrafacial Is One of the Best Summer Treatments. Summer can be harsh on your skin. With rising temperatures, increased humidity, and exposure to UV rays, our skin faces unique challenges...',
          content: `Summer can be harsh on your skin. With rising temperatures, increased humidity, and exposure to UV rays, our skin faces unique challenges. Sunburns, dehydration, clogged pores, and breakouts are common issues that can leave the skin looking dull and tired.

A Hydrafacial is a multi-step treatment that cleanses, exfoliates, extracts, and hydrates the skin. It utilizes a patented Vortex-Fusion delivery system to gently yet effectively address various skin concerns.

Unlike more invasive treatments, a Hydrafacial delivers immediate, visible results with absolutely no downtime, making it the perfect summer pick-me-up.

### The Power of Vortex Extraction
The patented vortex suction pulls dirt, sebum, and sunscreen residue straight out of your pores while simultaneously infusing skin with nourishing hyaluronic acid and peptides. This leaves the skin feeling clean, plump, and deeply hydrated without the redness associated with manual extractions.`,
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
          category: 'Skincare Treatment',
          author: 'Appointment Booking',
          dateString: '13 Jun'
        },
        {
          title: 'Why Hair Fall Increases During Summer – Causes, Prevention & Treatment',
          slug: 'why-hair-fall-increases-during-summer-causes-prevention-and-treatment',
          summary: 'Why Hair Fall Increases During Summer – Causes, Prevention & Treatment. Many people notice more hair fall as the weather warms up. Increased sweating, UV exposure, and dehydration all play a role...',
          content: `Many people notice more hair fall as the weather warms up. Increased sweating, UV exposure, and dehydration all play a role. During summer, the hot climate and strong sun can deplete the hair follicles of moisture, making the hair shafts brittle and prone to breakage.

To prevent excessive seasonal hair fall, it is important to stay hydrated, protect your scalp from direct sun exposure with hats or umbrellas, and use mild, hydrating shampoos.

For advanced hair fall concerns, clinical treatments such as scalp mesotherapy or PRP can stimulate blood circulation and revitalize weakened hair follicles.

### Top Tips to Protect Your Hair
- **Hydration is Key**: Drink plenty of water to keep the hair root nourished.
- **Wear Protective Gear**: Use a scarf or a hat under direct sunlight to prevent UV damage to the hair cuticles.
- **Wash Smartly**: Don't use extremely hot water for showers. Wash with cool or lukewarm water to prevent dry scalp issues.`,
          image: 'https://images.unsplash.com/photo-1566275529824-cca6d00a250f?auto=format&fit=crop&q=80&w=600',
          category: 'Hair Restoration',
          author: 'Appointment Booking',
          dateString: '04 Jun'
        }
      ];
      posts = await BlogPost.insertMany(defaults);
      posts.sort((a, b) => b.createdAt - a.createdAt);
    }
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new blog (Admin)
router.post('/', upload.single('blogImage'), async (req, res) => {
  let { title, slug, content, summary, image, category, author, dateString } = req.body;
  
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  if (!title || !slug || !content || !summary || !image || !dateString) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const newPost = await BlogPost.create({
      title,
      slug,
      content,
      summary,
      image,
      category,
      author,
      dateString
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update blog (Admin)
router.put('/:id', upload.single('blogImage'), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const updated = await BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE blog (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
