import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Menu, X, Search, ArrowRight, 
  Heart, Share2, Calendar, Tag, User, Mail, 
  Instagram, Twitter, Facebook, Zap, Coffee,
  PenTool, Image as ImageIcon, Send, Trash2,
  Lock, LogOut
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
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

// --- Firebase Initialization --
const firebaseConfig = {
  apiKey: "AIzaSyCMW-sVeuaiYFFoesurxEIzE_OTvWwca3Q",
  authDomain: "the-flux.firebaseapp.com",
  projectId: "the-flux",
  storageBucket: "the-flux.firebasestorage.app",
  messagingSenderId: "815537789700",
  appId: "1:815537789700:web:6358985106e87dfde2ce51",
  measurementId: "G-HTF40R5EPH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'the-flux-blog-v1'; 

// --- Components ---

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError("Access Denied. Wrong credentials.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Admin Access</h2>
          <p className="text-gray-500 text-sm">Identify yourself to access the mainframe.</p>
        </div>

        {error && <p className="text-red-500 text-center text-sm mb-4 font-bold">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            className="w-full px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-[1.02] transition-transform">
            Unlock Studio
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = ({ view, setView, darkMode, setDarkMode, user, onOpenLogin, onLogout }) => {
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
          <div onClick={() => setView('home')} className="flex-shrink-0 flex items-center cursor-pointer">
            <span className={`text-3xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-rose-500`}>
              THE FLUX<span className="text-teal-400 not-italic text-4xl">.</span>
            </span>
          </div>

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

            {/* Admin Logic */}
            {user ? (
               <div className="flex items-center gap-2">
                 <button onClick={() => setView('create')} className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-violet-700">
                    <PenTool size={14} /> <span>Create</span>
                 </button>
                 <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500">
                    <LogOut size={18} />
                 </button>
               </div>
            ) : (
                <button onClick={onOpenLogin} className="flex items-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform">
                  <Lock size={14} />
                  <span>Admin</span>
                </button>
            )}

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f172a] border-b dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => { setView(link.value); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                {link.name}
              </button>
            ))}
             <button onClick={() => { if(user) setView('create'); else onOpenLogin(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-violet-600 dark:text-violet-400">
                {user ? '+ Create Post' : 'Admin Login'}
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
          <p className="text-gray-500">Welcome back, Admin.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-lg font-bold text-gray-900 dark:text-white" placeholder="Title..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white">
                {['Lifestyle', 'Tech', 'Mindset', 'Fashion', 'Music', 'Rant'].map(c => <option key={c}>{c}</option>)}
             </select>
             <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white" placeholder="Image URL..." />
          </div>
          <textarea required name="excerpt" value={formData.excerpt} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white" placeholder="Excerpt..." />
          <textarea required name="content" value={formData.content} onChange={handleChange} rows="10" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white font-mono text-sm" placeholder="Content (Use ### for headers)..." />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold rounded-xl">{isSubmitting ? '...' : 'Publish'}</button>
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
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-rose-500 to-orange-400 italic">Code.</span>
      </h1>
      <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">The digital archive for the next generation.</p>
      <div className="flex justify-center gap-4">
        <button onClick={() => setView('blog')} className="px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-105 transition-transform shadow-lg flex items-center">
          Read The Latest <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);

const PostCard = ({ post, onClick, onDelete, isAdmin }) => (
  <div onClick={onClick} className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative">
    <div className="relative h-56 overflow-hidden">
      <img src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} />
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">{post.category}</div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
        <span className="flex items-center"><Calendar size={14} className="mr-1"/> {post.date}</span>
        <span className="flex items-center"><Coffee size={14} className="mr-1"/> {post.readTime}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">By {post.author}</span>
        </div>
        {isAdmin && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-gray-400 hover:text-red-500 p-2 z-10" title="Delete Post"><Trash2 size={16} /></button>
        )}
      </div>
    </div>
  </div>
);

const BlogGrid = ({ posts, onPostClick, onDeletePost, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...new Set(posts.map(p => p.category))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">The Archive</h2>
        <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-all ${selectedCategory === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-600'}`}>{cat}</button>
        ))}
      </div>
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} onDelete={onDeletePost} isAdmin={isAdmin} />)}
        </div>
      ) : <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl"><p className="text-gray-500">No content found.</p></div>}
    </div>
  );
};

const SinglePost = ({ post, onBack }) => (
  <article className="pt-24 pb-20 min-h-screen animate-fade-in">
    <div className="w-full h-[40vh] sm:h-[50vh] relative mb-8 sm:mb-12">
        <img src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} className="w-full h-full object-cover" alt="Cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} />
        <div className="absolute bottom-0 left-0 w-full z-20 p-4 sm:p-8 md:p-16 max-w-5xl mx-auto bg-gradient-to-t from-black/80 to-transparent">
            <button onClick={onBack} className="text-white mb-4 flex items-center font-bold uppercase tracking-widest hover:underline"><ArrowRight className="rotate-180 mr-2" size={16}/> Back</button>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-2">{post.title}</h1>
            <p className="text-white/80 font-bold">{post.date} • {post.readTime}</p>
        </div>
    </div>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-lg dark:prose-invert prose-violet">
        {post.content.split('\n').map((p, i) => p.startsWith('###') ? <h3 key={i} className="font-bold text-2xl mt-6 mb-2 text-gray-900 dark:text-white">{p.replace('###', '')}</h3> : <p key={i} className="mb-4 text-gray-600 dark:text-gray-300">{p}</p>)}
    </div>
  </article>
);

const App = () => {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // 1. Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    // 2. Fetch posts (No login required to read)
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const fetchPosts = async () => {
        try {
            const snap = await getDocs(query(postsRef));
            const fetched = snap.docs.map(d => ({id: d.id, ...d.data()}));
            fetched.sort((a, b) => new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0));
            setPosts(fetched);
        } catch (err) { console.error("Fetch error", err); } 
        finally { setLoading(false); }
    };
    fetchPosts();
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  const handlePublish = async (newPostData) => {
    if (!user) return; // Admin check
    try {
        const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
        const docRef = await addDoc(postsRef, { ...newPostData, createdAt: serverTimestamp() });
        setPosts(prev => [{id: docRef.id, ...newPostData}, ...prev]);
        setView('blog');
    } catch (error) { alert("Error publishing."); }
  };

  const handleDeletePost = async (postId) => {
      if (!user) return;
      if (!confirm("Delete this post?")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId));
          setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (error) { console.error("Error deleting", error); }
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} font-sans`}>
      <div className={`min-h-screen transition-colors duration-300 ${THEME.bg} ${THEME.bgDark}`}>
        <Navbar 
            view={view} setView={(v) => { setView(v); window.scrollTo(0,0); }} 
            darkMode={darkMode} setDarkMode={setDarkMode} 
            user={user} onOpenLogin={() => setShowLogin(true)} onLogout={handleLogout}
        />

        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />

        <main className="animate-fade-in">
          {loading ? <div className="h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-violet-600 rounded-full animate-spin"></div></div> : (
            <>
              {view === 'home' && (
                <>
                  <Hero setView={setView} />
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex justify-between items-end mb-8"><h2 className="text-3xl font-black text-gray-900 dark:text-white">Latest Drops</h2><button onClick={() => setView('blog')} className="text-violet-600 font-bold hover:underline">View All</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} onClick={() => { setSelectedPost(post); setView('post'); }} onDelete={handleDeletePost} isAdmin={!!user} />)}</div>
                  </div>
                </>
              )}
              {view === 'blog' && <BlogGrid posts={posts} onPostClick={(p) => { setSelectedPost(p); setView('post'); }} onDeletePost={handleDeletePost} isAdmin={!!user} />}
              {view === 'post' && selectedPost && <SinglePost post={selectedPost} onBack={() => setView('blog')} />}
              {view === 'create' && user && <CreatePost onPublish={handlePublish} onCancel={() => setView('home')} />}
              {view === 'about' && <div className="pt-32 text-center text-gray-500"><h1 className="text-4xl font-bold text-gray-900 dark:text-white">About Us</h1><p className="mt-4">THE FLUX is a digital archive.</p></div>}
              {view === 'contact' && <div className="pt-32 text-center text-gray-500"><h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contact</h1><p className="mt-4">hello@theflux.com</p></div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;