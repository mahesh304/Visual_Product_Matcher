# Visual Product Matcher 🔍

Find similar products by uploading images - like Google Lens for shopping!

**🌐 Live Demo:** https://visual-product-matcher-frontend-b5hz.onrender.com  
**💻 GitHub:** https://github.com/mahesh304/Visual_Product_Matcher

---

## 💡 What Problem Does This Solve?

Ever seen a product you like but don't know what it's called? Traditional search requires you to describe it in words, which is difficult. Our app lets you simply **upload a photo** and instantly finds similar products!

---

## ✨ Main Features

### Search & Match
- 📸 **Upload photos** or paste image links
- 🤖 **AI-powered** matching using advanced computer vision
- ⚡ **Fast results** in under 2 seconds
- 📊 **Similarity scores** show how close each match is (0-100%)
- 📱 **Works everywhere** - phone, tablet, or computer

### User Features
- 🔐 **Create an account** to save your search history
- 📜 **View past searches** with timestamps and results
- 🔒 **Secure login** with password strength checker
- 💾 **Auto-save** all your searches when logged in

### Design
- 🎨 **Modern interface** with smooth animations
- 🌈 **Color-coded results** - green for best matches
- 📱 **Mobile-friendly** with easy touch controls
- ♿ **Accessible** for screen readers and keyboards

---

## 🛍️ Product Database

**100 Products** across these categories:
- 👕 **Clothing** (30+): Shirts, dresses, jackets, hoodies
- 👟 **Footwear** (12): Sneakers, boots, sandals, dress shoes
- 👜 **Accessories** (20+): Watches, bags, sunglasses, wallets
- 💻 **Electronics** (25+): Headphones, cameras, keyboards, monitors
- 📝 **Office Items** (13+): Notebooks, pens, desk accessories

All products include:
- High-quality images
- Name and category
- Price in Indian Rupees (₹)

---

## 🎯 How It Works

### Simple 4-Step Process:

1. **Upload Image** 
   - Click to select or drag & drop a photo
   - Or paste an image URL
   - Supports JPG, PNG, WebP (up to 5MB)

2. **AI Analysis**
   - App extracts visual features (colors, patterns, shapes)
   - Compares against 100 product images
   - Takes about 2 seconds

3. **Get Results**
   - Shows matched products sorted by similarity
   - Each has a percentage score (higher = better match)
   - Green badges for great matches (70%+)

4. **Save History** (if logged in)
   - Your search automatically saves
   - View anytime on History page
   - See what you searched and when

---

## 🖥️ Technology Used

**Frontend (What You See):**
- React - For the user interface
- TailwindCSS - For beautiful design
- Vite - For fast loading

**Backend (Behind the Scenes):**
- Node.js & Express - Server
- MongoDB - Database for users and history
- AI Image Recognition - Matches similar products

---

## 📄 Pages Overview

### 🏠 Home Page
**What you see:**
- Large upload area - drag & drop or click to upload
- URL input box - paste any image link
- "Find Similar Products" button
- 6 feature cards explaining what the app does
- Statistics showing accuracy and speed

**What happens:**
1. You upload an image or paste URL
2. Click the search button
3. Loading spinner appears
4. Redirects to Results page

---

### 🔍 Results Page
**What you see:**
- Your uploaded image at the top
- Grid of similar products below (up to 50)
- Each product shows:
  - Product image
  - Name and category
  - Price in ₹
  - Similarity percentage badge (color-coded)

**How it works:**
- Products sorted from most similar to least
- Hover over products to see zoom effect
- Click "View Details" for more info
- Green badge = excellent match (70%+)
- Yellow badge = good match (50-70%)
- Gray badge = fair match (below 50%)

**Layout:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

---

### 📚 History Page
**What you see:**
- Grid of your past searches
- Each search shows:
  - The image you uploaded
  - Date and time of search
  - Number of matches found
  - Preview of top matches

**How it works:**
1. Must be logged in to see this page
2. Every search automatically saves
3. Click any search to see full results again
4. Newest searches appear first

**If not logged in:**
- Redirects to login page
- Prompts you to create account

**Layout:**
- Mobile: 1 column
- Tablet: 2-3 columns  
- Desktop: 4 columns

---

### 🔐 Login & Signup Pages

**Modern Split-Screen Design:**

**Left Side (Form):**
- Clean input fields with icons
- Email field (✉️ icon)
- Password field (🔒 icon) with show/hide toggle
- Name field for signup (👤 icon)
- Password strength meter (Signup only)
  - Red = Weak
  - Yellow = Fair/Good
  - Green = Strong
- Large colorful button to submit
- Link to switch between Login/Signup

**Right Side (Benefits - Desktop Only):**
- Beautiful animated gradient background
- 3 cards highlighting features:
  - AI-Powered Search
  - Fast Results
  - Smart History
- App statistics
- Hidden on mobile to save space

**What happens when you submit:**
- **Signup**: Creates your account → Logs you in → Redirects to home
- **Login**: Verifies credentials → Logs you in → Redirects to home
- **Error**: Shows message if something goes wrong

---

## 🎨 User Experience Features

### Visual Feedback
- ✅ **Green badges** - Great matches
- ⚠️ **Yellow badges** - Good matches
- ⚪ **Gray badges** - Fair matches
- 🔄 **Loading spinners** - Processing
- ❌ **Red borders** - Errors

### Animations
- Smooth hover effects on cards
- Gradient backgrounds that flow
- Menu slides in on mobile
- Page transitions

### Responsive Design
- **Phone** (under 640px): 1 column, hamburger menu
- **Tablet** (640-1024px): 2-3 columns, compact layout
- **Desktop** (1024px+): Full layout with 4 columns

---

## 🔒 Security & Privacy

- Passwords are encrypted (never stored in plain text)
- Secure login tokens expire after 7 days
- Your searches are private (only you can see them)
- All connections are protected

---

## 📊 Performance

- ⚡ Search results in **under 2 seconds**
- 🎯 **80-85% accuracy** for similar products
- 📦 Lightweight **~300KB** total download
- 🚀 Fast loading with optimized images

---

## 🚀 Getting Started

1. Visit https://visual-product-matcher-frontend-b5hz.onrender.com
2. Upload any product image
3. See similar products instantly!
4. (Optional) Create account to save searches

