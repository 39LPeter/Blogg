import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Menu, X, Search, ArrowRight, 
  Heart, Share2, Calendar, Tag, User, Mail, 
  Instagram, Twitter, Facebook, Zap, Coffee,
  PenTool, Image as ImageIcon, Send, Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  deleteDoc,
  doc, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// --- Configuration ---
const THEME = {
  bg: 'bg-[#F8FAFC]',
  bgDark: 'dark:bg-[#0f172a]',
  primary: 'text-[#7C3AED]',
  text: 'text-[#1F2937]',
  textDark: 'dark:text-[#F1F5F9]'
};

const firebaseConfig = {
  apiKey: "AIzaSyCMW-sVeuaiYFFoesurxEIzE_OTvWwca3Q",
  authDomain: "the-flux.firebaseapp.com",
  projectId: "the-flux",
  storageBucket: "the-flux.firebasestorage.app",
  messagingSenderId: "815537789700",
  appId: "1:815537789700:web:6358985106e87dfde2ce51",
  measurementId: "G-HTF40R5EPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
// We use a hardcoded ID for the demo to keep things simple
const appId = 'the-flux-blog-v1'; 

// --- Components ---

const Navbar = ({ view, setView, darkMode, setDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', value: 'home' },
    { name: 'About', value: 'about' },
    { name: 'Blog', value: 'blog' },
    { name: 'Contact', value: 'contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${darkMode ? 'bg-[#0f172a]/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => setView('home')}
            className="flex-shrink-0 flex items-center cursor-pointer"
          >
            <span className={`text-3xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-rose-500`}>
              THE FLUX<span className="text-teal-400 not-italic text-4xl">.</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setView(link.value)}
                className={`${view === link.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'} font-bold text-sm uppercase tracking-wide transition-colors`}
              >
                {link.name}
              </button>
            ))}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

            {/* Write Button */}
            <button
              onClick={() => setView('create')}
              className="flex items-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
            >
              <PenTool size={14} />
              <span>Write</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f172a] border-b dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  setView(link.value);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {link.name}
              </button>
            ))}
             <button
                onClick={() => {
                  setView('create');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-violet-600 dark:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                + Create Post
              </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const CreatePost = ({ onPublish, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Lifestyle',
    imageUrl: '',
    author: 'Admin' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onPublish({
        ...formData,
        readTime: `${Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        likes: 0
    });
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Creator Studio</h2>
          <p className="text-gray-500">Share your unfiltered thoughts with the world.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="e.g. Why I Quit Social Media..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                >
                  <option>Lifestyle</option>
                  <option>Tech</option>
                  <option>Mindset</option>
                  <option>Fashion</option>
                  <option>Music</option>
                  <option>Rant</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                    <input 
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                      placeholder="https://..."
                    />
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Excerpt (Short Description)</label>
            <textarea 
              required
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
              placeholder="A quick hook to grab attention..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Content</label>
            <textarea 
              required
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Start writing here. Use ### for headers."
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">Tip: Use ### for section headers to make them bold.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center"
            >
              {isSubmitting ? 'Publishing...' : <><Send className="mr-2 h-5 w-5"/> Publish Story</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Hero = ({ setView }) => (
  <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-semibold mb-6">
        <span className="flex h-2 w-2 rounded-full bg-violet-600 mr-2 animate-pulse"></span>
        Live on THE FLUX
      </div>
      <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6">
        <span className="block text-gray-900 dark:text-white mb-2">Chaos. Culture.</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-rose-500 to-orange-400 italic">
          Code.
        </span>
      </h1>
      <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
        The digital archive for the next generation. Unfiltered takes on the things that actually matter.
      </p>
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setView('blog')}
          className="px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl flex items-center"
        >
          Read The Latest <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>

    {/* Background Blobs */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none opacity-40 dark:opacity-20">
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>
  </div>
);

const PostCard = ({ post, onClick, onDelete }) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative"
  >
    <div className="relative h-56 overflow-hidden">
      <img 
        src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} 
        alt={post.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'}
      />
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
        {post.category}
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
        <span className="flex items-center"><Calendar size={14} className="mr-1"/> {post.date}</span>
        <span className="flex items-center"><Coffee size={14} className="mr-1"/> {post.readTime}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
            {post.author.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{post.author}</span>
        </div>
        {/* Delete Button (For demo purposes) */}
        <button 
            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete Post"
        >
            <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const BlogGrid = ({ posts, onPostClick, onDeletePost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(posts.map(p => p.category))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">The Archive</h2>
          <p className="text-gray-500 dark:text-gray-400">Browse the latest drops.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500" />
            </div>
            <input
              type="text"
              placeholder="Search content..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
              selectedCategory === cat 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <PostCard 
                key={post.id} 
                post={post} 
                onClick={() => onPostClick(post)} 
                onDelete={onDeletePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 text-lg">No content found.</p>
        </div>
      )}
    </div>
  );
};

const SinglePost = ({ post, onBack }) => (
  <article className="pt-24 pb-20 min-h-screen animate-fade-in">
    <div className="w-full h-[40vh] sm:h-[50vh] relative mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-90"></div>
        <img 
            src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} 
            className="w-full h-full object-cover" 
            alt="Cover"
            onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'}
        />
        <div className="absolute bottom-0 left-0 w-full z-20 p-4 sm:p-8 md:p-16 max-w-5xl mx-auto">
            <button onClick={onBack} className="text-white/80 hover:text-white mb-6 flex items-center text-sm font-bold uppercase tracking-widest hover:underline">
                <ArrowRight className="rotate-180 mr-2" size={16}/> Back to Archive
            </button>
            <div className="inline-block bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {post.category}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
                {post.title}
            </h1>
            <div className="flex items-center text-white/90 space-x-6">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold mr-3">
                        {post.author.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{post.author}</p>
                        <p className="text-xs opacity-80">{post.date}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="prose prose-lg dark:prose-invert prose-violet max-w-none mb-16">
            {post.content.split('\n').map((paragraph, idx) => {
                if (paragraph.trim().startsWith('###')) {
                    return <h3 key={idx} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{paragraph.replace('###', '')}</h3>
                }
                if (paragraph.trim() === '') return <br key={idx} />;
                return <p key={idx} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{paragraph}</p>
            })}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Share this vibe</h3>
            <div className="flex gap-4">
                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100 hover:text-violet-600 transition-colors"><Twitter size={20}/></button>
                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600 transition-colors"><Instagram size={20}/></button>
                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 transition-colors"><Facebook size={20}/></button>
            </div>
        </div>
    </div>
  </article>
);

const About = () => (
  <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
    <div className="text-center mb-16">
      <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
        We are <span className="text-violet-600">THE FLUX</span>.
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400">
        Digital noise, filtered for signal.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
      <div className="relative">
         <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-rose-400 rounded-3xl transform rotate-3 opacity-50 blur-lg"></div>
         <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Team" 
            className="relative rounded-3xl shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
         />
      </div>
      <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
        <p>
            <strong className="text-gray-900 dark:text-white block text-xl mb-2">Our Mission</strong>
            The internet is broken. It's too polished, too corporate, too fake. THE FLUX is our attempt to fix it.
        </p>
        <p>
            We provide a platform for raw thoughts and bold ideas. No corporate filters. Just real talk.
        </p>
      </div>
    </div>
  </div>
);

const Contact = () => (
  <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl p-8 sm:p-12 border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Slide into the DMs</h2>
        <p className="text-gray-500">Ideally via email, but we take what we can get.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => {e.preventDefault(); alert('Sent! We will leave you on read (kidding).');}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Name</label>
                <input required type="text" className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 transition-all" placeholder="Your name" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                <input required type="email" className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 transition-all" placeholder="hello@example.com" />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Message</label>
            <textarea required rows="4" className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 transition-all" placeholder="What's on your mind?"></textarea>
        </div>
        <button type="submit" className="w-full py-5 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            Send It
        </button>
      </form>
    </div>
  </div>
);

const Footer = ({ setView }) => (
  <footer className="bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>&copy; 2024 THE FLUX. All rights reserved.</p>
        <p className="flex items-center mt-4 sm:mt-0">
          Made with <Heart size={12} className="mx-1 text-rose-500 fill-current"/> for the culture.
        </p>
      </div>
    </div>
  </footer>
);

const App = () => {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Auth & Data Fetching
  useEffect(() => {
    const init = async () => {
        try {
            // We simply try to sign in anonymously here for the demo
            await signInAnonymously(auth);
        } catch (e) {
            console.error("Auth error", e);
        }
    };
    init();

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // We use a simple collection path for the demo
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');

    const fetchPosts = async () => {
        try {
            // Fetch all docs and sort in memory for this demo
            const snapshot = await getDocs(query(postsRef));
            const fetchedPosts = snapshot.docs.map(d => ({id: d.id, ...d.data()}));

            // Basic date sort (descending)
            fetchedPosts.sort((a, b) => new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0));

            if (fetchedPosts.length === 0) {
                // Seed if empty
                const SEED_POSTS = [
                    {
                        title: "Welcome to THE FLUX",
                        excerpt: "This is the beginning of a new digital era.",
                        content: "Welcome to the new wave. This is a sample post to get you started. ### Delete this and start writing.",
                        category: "Lifestyle",
                        date: "Nov 22, 2024",
                        author: "Admin",
                        readTime: "1 min",
                        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                        likes: 0,
                        createdAt: serverTimestamp()
                    }
                ];

                for (const p of SEED_POSTS) {
                    await addDoc(postsRef, p);
                }
                // Re-fetch
                const newSnap = await getDocs(postsRef);
                setPosts(newSnap.docs.map(d => ({id: d.id, ...d.data()})));
            } else {
                setPosts(fetchedPosts);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();
  }, [user]);

  // Create Post Handler
  const handlePublish = async (newPostData) => {
    if (!user) return;
    try {
        const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
        const docRef = await addDoc(postsRef, {
            ...newPostData,
            createdAt: serverTimestamp()
        });

        // Add to local state immediately for UI responsiveness
        setPosts(prev => [{id: docRef.id, ...newPostData}, ...prev]);
        setView('blog');
        window.scrollTo(0,0);
    } catch (error) {
        console.error("Error publishing:", error);
        alert("Failed to publish. Check console.");
    }
  };

  const handleDeletePost = async (postId) => {
      if (!confirm("Are you sure you want to delete this post?")) return;
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
          await deleteDoc(docRef);
          setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (error) {
          console.error("Error deleting:", error);
      }
  }

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('post');
    window.scrollTo(0,0);
  };

  const handleBackToBlog = () => {
    setSelectedPost(null);
    setView('blog');
    window.scrollTo(0,0);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} font-sans`}>
      <div className={`min-h-screen transition-colors duration-300 ${THEME.bg} ${THEME.bgDark}`}>

        <Navbar 
            view={view} 
            setView={(v) => { setView(v); window.scrollTo(0,0); }} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
        />

        <main className="animate-fade-in">
          {loading ? (
             <div className="h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              {view === 'home' && (
                <>
                  <Hero setView={setView} />
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Latest Drops</h2>
                        <button onClick={() => setView('blog')} className="text-violet-600 font-bold hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {posts.slice(0, 3).map(post => (
                        <PostCard key={post.id} post={post} onClick={() => handlePostClick(post)} onDelete={handleDeletePost} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {view === 'blog' && (
                <BlogGrid posts={posts} onPostClick={handlePostClick} onDeletePost={handleDeletePost} />
              )}

              {view === 'post' && selectedPost && (
                <SinglePost post={selectedPost} onBack={handleBackToBlog} />
              )}

              {view === 'create' && (
                <CreatePost onPublish={handlePublish} onCancel={() => setView('home')} />
              )}

              {view === 'about' && <About />}

              {view === 'contact' && <Contact />}
            </>
          )}
        </main>

        <Footer setView={(v) => { setView(v); window.scrollTo(0,0); }} />

      </div>
      <style>{`
        .animate-blob {
            animation: blob 7s infinite;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;