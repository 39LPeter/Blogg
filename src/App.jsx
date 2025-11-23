import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Menu, X, Search, ArrowRight, 
  Heart, Share2, Calendar, Tag, User, Mail, 
  Instagram, Twitter, Facebook, Zap, Coffee,
  PenTool, Image as ImageIcon, Send, Trash2,
  Lock, LogOut, MessageSquare, Edit2
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
  updateDoc,
  doc, 
  increment,
  orderBy,
  onSnapshot,
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

// --- Firebase Initialization ---
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
          <input type="email" placeholder="Admin Email" className="w-full px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-[1.02] transition-transform">Unlock Studio</button>
        </form>
      </div>
    </div>
  );
};

const Navbar = ({ view, setView, darkMode, setDarkMode, user, onOpenLogin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [{ name: 'Home', value: 'home' }, { name: 'Blog', value: 'blog' }, { name: 'About', value: 'about' }, { name: 'Contact', value: 'contact' }];

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
              <button key={link.name} onClick={() => setView(link.value)} className={`${view === link.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'} font-bold text-sm uppercase tracking-wide transition-colors`}>{link.name}</button>
            ))}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            {user ? (
               <div className="flex items-center gap-2">
                 <button onClick={() => setView('create')} className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase hover:bg-violet-700">
                    <PenTool size={14} /> <span>Create</span>
                 </button>
                 <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500"><LogOut size={18} /></button>
               </div>
            ) : (
                <button onClick={onOpenLogin} className="flex items-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform">
                  <Lock size={14} /> <span>Admin</span>
                </button>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 dark:text-gray-300">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f172a] border-b dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => <button key={link.name} onClick={() => { setView(link.value); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">{link.name}</button>)}
             <button onClick={() => { if(user) setView('create'); else onOpenLogin(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-violet-600 dark:text-violet-400">{user ? '+ Create Post' : 'Admin Login'}</button>
          </div>
        </div>
      )}
    </nav>
  );
};

const CreatePost = ({ onPublish, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '', excerpt: '', content: '', category: 'Lifestyle', imageUrl: '', author: 'Admin'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onPublish({
        ...formData,
        readTime: `${Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min`,
        date: initialData ? initialData.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        likes: initialData ? initialData.likes : 0
    });
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{initialData ? 'Edit Post' : 'Creator Studio'}</h2>
          <p className="text-gray-500">{initialData ? 'Updating content...' : 'Welcome back, Admin.'}</p>
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
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold rounded-xl">{isSubmitting ? '...' : (initialData ? 'Update' : 'Publish')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Using subcollections: artifacts/{appId}/public/data/posts/{postId}/comments
        const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!newComment.trim() || !name.trim()) return;

        try {
            const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts', postId, 'comments');
            await addDoc(commentsRef, {
                text: newComment,
                author: name,
                createdAt: serverTimestamp()
            });
            setNewComment('');
            setName('');
        } catch (error) {
            console.error("Error adding comment", error);
            alert("Could not post comment. Check permissions.");
        }
    };

    return (
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                <MessageSquare className="mr-2" /> Community Chatter
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-10">
                {comments.length === 0 && !loading ? (
                    <p className="text-gray-500 italic">No comments yet. Be the first to roast this post.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-violet-600 text-sm">{comment.author}</span>
                                <span className="text-xs text-gray-400">Just now</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Drop a comment</h4>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Your Name (Public)" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                    />
                    <textarea 
                        rows="3"
                        placeholder="What's your take?" 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                    ></textarea>
                    <button type="submit" className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors text-sm">
                        Post Comment
                    </button>
                </div>
            </form>
        </div>
    );
};

const SinglePost = ({ post, onBack, onLike }) => {
    const [liked, setLiked] = useState(false);

    const handleLikeClick = () => {
        if (liked) return;
        setLiked(true);
        onLike(post.id);
    };

    return (
        <article className="pt-24 pb-20 min-h-screen animate-fade-in">
            <div className="w-full h-[40vh] sm:h-[50vh] relative mb-8 sm:mb-12">
                <img src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} className="w-full h-full object-cover" alt="Cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} />
                <div className="absolute bottom-0 left-0 w-full z-20 p-4 sm:p-8 md:p-16 max-w-5xl mx-auto bg-gradient-to-t from-black/80 to-transparent">
                    <button onClick={onBack} className="text-white mb-4 flex items-center font-bold uppercase tracking-widest hover:underline"><ArrowRight className="rotate-180 mr-2" size={16}/> Back</button>
                    <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-2">{post.title}</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-white/80 font-bold">{post.date} • {post.readTime}</p>
                    </div>
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 font-bold">
                            {post.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-bold text-sm">{post.author}</p>
                            <p className="text-gray-500 text-xs">Author</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLikeClick}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${liked ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-500'}`}
                    >
                        <Heart className={liked ? "fill-current" : ""} size={20} />
                        <span className="font-bold">{post.likes || 0}</span>
                    </button>
                </div>

                <div className="prose prose-lg dark:prose-invert prose-violet mb-10">
                    {post.content.split('\n').map((p, i) => p.startsWith('###') ? <h3 key={i} className="font-bold text-2xl mt-6 mb-2 text-gray-900 dark:text-white">{p.replace('###', '')}</h3> : <p key={i} className="mb-4 text-gray-600 dark:text-gray-300">{p}</p>)}
                </div>

                {/* Comment Section */}
                <CommentsSection postId={post.id} />
            </div>
        </article>
    );
};

const PostCard = ({ post, onClick, onDelete, onEdit, isAdmin }) => (
  <div onClick={onClick} className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative">
    <div className="relative h-56 overflow-hidden">
      <img src={post.imageUrl || 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => e.target.src = 'https://placehold.co/600x400/violet/white?text=THE+FLUX'} />
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">{post.category}</div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
        <span className="flex items-center"><Calendar size={14} className="mr-1"/> {post.date}</span>
        <span className="flex items-center"><Heart size={14} className="mr-1"/> {post.likes || 0}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">By {post.author}</span>
        {isAdmin && (
            <div className="flex gap-2 z-10">
                <button onClick={(e) => { e.stopPropagation(); onEdit(post); }} className="text-gray-400 hover:text-violet-500 p-2 bg-gray-100 dark:bg-gray-900 rounded-full" title="Edit Post"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-gray-400 hover:text-red-500 p-2 bg-gray-100 dark:bg-gray-900 rounded-full" title="Delete Post"><Trash2 size={16} /></button>
            </div>
        )}
      </div>
    </div>
  </div>
);

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
      <div className="flex justify-center gap-4">
        <button onClick={() => setView('blog')} className="px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:scale-105 transition-transform shadow-lg flex items-center">
          Read The Latest <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // New State for editing
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');

    // Real-time listener for posts to see likes update instantly
    const unsubscribePosts = onSnapshot(query(postsRef), (snapshot) => {
        const fetched = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        fetched.sort((a, b) => new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0));
        setPosts(fetched);
        setLoading(false);
    });

    return () => { unsubscribeAuth(); unsubscribePosts(); }
  }, []);

  const handleLogin = async (email, password) => await signInWithEmailAndPassword(auth, email, password);
  const handleLogout = async () => { await signOut(auth); setView('home'); };

  // Handle Create OR Update
  const handleSavePost = async (postData) => {
    if (!user) return;
    try {
        const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');

        if (editingPost) {
            // UPDATE Existing
            const docRef = doc(postsRef, editingPost.id);
            await updateDoc(docRef, postData);
            setEditingPost(null);
        } else {
            // CREATE New
            await addDoc(postsRef, { ...postData, createdAt: serverTimestamp(), likes: 0 });
        }
        setView('blog');
    } catch (error) { alert("Error saving post."); }
  };

  const handleEditClick = (post) => {
      setEditingPost(post);
      setView('create');
  };

  const handleDeletePost = async (postId) => {
      if (!user || !confirm("Delete this post?")) return;
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId)); } 
      catch (error) { console.error("Error deleting", error); }
  };

  const handleLikePost = async (postId) => {
      const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
      await updateDoc(postRef, { likes: increment(1) });
  };

  const BlogGrid = ({ posts }) => {
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('All');
      const categories = ['All', ...new Set(posts.map(p => p.category))];
      const filtered = posts.filter(post => 
        (selectedCategory === 'All' || post.category === selectedCategory) &&
        (post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">The Archive</h2>
            <input type="text" placeholder="Search..." className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${selectedCategory === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-600'}`}>{cat}</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map(post => (
                <PostCard 
                    key={post.id} post={post} isAdmin={!!user}
                    onClick={() => { setSelectedPost(post); setView('post'); }} 
                    onDelete={handleDeletePost} 
                    onEdit={handleEditClick} 
                />
            ))}
          </div>
        </div>
      );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} font-sans`}>
      <div className={`min-h-screen transition-colors duration-300 ${THEME.bg} ${THEME.bgDark}`}>
        <Navbar view={view} setView={(v) => { setView(v); setEditingPost(null); window.scrollTo(0,0); }} darkMode={darkMode} setDarkMode={setDarkMode} user={user} onOpenLogin={() => setShowLogin(true)} onLogout={handleLogout} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
        <main className="animate-fade-in">
          {loading ? <div className="h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-violet-600 rounded-full animate-spin"></div></div> : (
            <>
              {view === 'home' && (
                <>
                  <Hero setView={setView} />
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} isAdmin={!!user} onClick={() => { setSelectedPost(post); setView('post'); }} onDelete={handleDeletePost} onEdit={handleEditClick} />)}</div>
                  </div>
                </>
              )}
              {view === 'blog' && <BlogGrid posts={posts} />}
              {view === 'post' && selectedPost && <SinglePost post={selectedPost} onBack={() => setView('blog')} onLike={handleLikePost} />}
              {view === 'create' && user && <CreatePost onPublish={handleSavePost} onCancel={() => { setView('home'); setEditingPost(null); }} initialData={editingPost} />}
              {view === 'about' && <div className="pt-32 text-center text-gray-500"><h1 className="text-4xl font-bold text-gray-900 dark:text-white">About Us</h1></div>}
              {view === 'contact' && <div className="pt-32 text-center text-gray-500"><h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contact</h1></div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;