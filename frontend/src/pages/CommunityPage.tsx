import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Award, 
  Calendar, 
  Filter, 
  Search, 
  Plus, 
  Camera, 
  X, 
  ChevronDown,
  Sparkles,
  Zap,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWardrobe } from '../contexts/WardrobeContext';
import FashionBackground from '../components/FashionBackground';
import { communityService } from '../services/communityService';
import CreatePostModal from '../components/community/CreatePostModal';
import StyleChallengeCard from '../components/community/StyleChallengeCard';
import OutfitPost from '../components/community/OutfitPost';
import CommunityLeaderboard from '../components/community/CommunityLeaderboard';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { items } = useWardrobe();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCommunityData = async () => {
      setIsLoading(true);
      try {
        // Fetch posts, challenges, and trending users
        const [postsData, challengesData, usersData] = await Promise.all([
          communityService.getPosts(),
          communityService.getChallenges(),
          communityService.getTrendingUsers()
        ]);
        
        setPosts(postsData);
        setChallenges(challengesData);
        setTrendingUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch community data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleCreatePost = async (postData: any) => {
    try {
      const newPost = await communityService.createPost(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowCreatePost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked 
              } 
            : post
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await communityService.joinChallenge(challengeId);
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, isJoined: true, participants: challenge.participants + 1 } 
            : challenge
        )
      );
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'following' && post.user.isFollowing) return true;
    if (filter === 'challenges' && post.challenge) return true;
    if (filter === 'trending' && post.isTrending) return true;
    return false;
  }).filter(post => {
    if (!searchQuery) return true;
    return (
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.challenge && post.challenge.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aesthetic Background */}
      <FashionBackground />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Style Community</h1>
                  <p className="text-gray-600">Share outfits, join challenges, and get inspired</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search posts, challenges, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm"
                  />
                </div>
                
                {/* Create Post Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  <Plus size={18} />
                  <span>Create Post</span>
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="inline w-4 h-4 mr-2" />
                Community Feed
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'challenges'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="inline w-4 h-4 mr-2" />
                Style Challenges
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="inline w-4 h-4 mr-2" />
                Leaderboard
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* User Profile Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h3>
                    <p className="text-gray-600">@{user?.name?.toLowerCase().replace(/\s+/g, '') || 'username'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-600">Posts</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-600">Followers</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-600">Following</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                    Complete Profile
                  </button>
                  <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Share Profile
                  </button>
                </div>
              </div>
              
              {/* Active Challenges */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Challenges</h3>
                  <button 
                    onClick={() => setActiveTab('challenges')}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    View All
                  </button>
                </div>
                
                {challenges.filter(challenge => challenge.isActive).slice(0, 3).map(challenge => (
                  <div key={challenge.id} className="mb-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{challenge.name}</h4>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {challenge.daysLeft} days left
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{challenge.participants} participants</span>
                      {challenge.isJoined ? (
                        <span className="text-xs text-green-600 font-medium">Joined</span>
                      ) : (
                        <button 
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="text-xs text-purple-600 font-medium hover:text-purple-800"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {challenges.filter(challenge => challenge.isActive).length === 0 && (
                  <div className="text-center py-6">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No active challenges</p>
                    <button 
                      onClick={() => setActiveTab('challenges')}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                    >
                      Explore Challenges
                    </button>
                  </div>
                )}
              </div>
              
              {/* Trending Users */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Stylists</h3>
                
                {trendingUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        {user.profilePic ? (
                          <img 
                            src={user.profilePic} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=150';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.followers} followers</p>
                      </div>
                    </div>
                    <button className={`text-xs px-3 py-1 rounded-full ${
                      user.isFollowing 
                        ? 'bg-gray-200 text-gray-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              {isLoading ? (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading community content...</p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'feed' ? (
                <div className="space-y-6">
                  {/* Feed Filters */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                          filter === 'all'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => setFilter('following')}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                          filter === 'following'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Following
                      </button>
                      <button
                        onClick={() => setFilter('challenges')}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                          filter === 'challenges'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Challenges
                      </button>
                      <button
                        onClick={() => setFilter('trending')}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                          filter === 'trending'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        Trending
                      </button>
                    </div>
                  </div>
                  
                  {/* Posts */}
                  {filteredPosts.length === 0 ? (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 text-center">
                      <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Found</h3>
                      <p className="text-gray-600 mb-6">
                        {filter === 'all' 
                          ? "Be the first to share your style with the community!"
                          : filter === 'following'
                          ? "Follow some stylists to see their posts here"
                          : filter === 'challenges'
                          ? "Join a challenge and share your entry"
                          : "No trending posts at the moment"}
                      </p>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                      >
                        <Plus size={18} className="mr-2" />
                        Create First Post
                      </button>
                    </div>
                  ) : (
                    filteredPosts.map(post => (
                      <OutfitPost 
                        key={post.id} 
                        post={post} 
                        onLike={() => handleLikePost(post.id)} 
                      />
                    ))
                  )}
                </div>
              ) : activeTab === 'challenges' ? (
                <div className="space-y-6">
                  {/* Challenge Categories */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      <button
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      >
                        All Challenges
                      </button>
                      <button
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Active
                      </button>
                      <button
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Upcoming
                      </button>
                      <button
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Completed
                      </button>
                      <button
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        My Challenges
                      </button>
                    </div>
                  </div>
                  
                  {/* Challenge Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.length === 0 ? (
                      <div className="md:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 text-center">
                        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                          <Award className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Challenges Available</h3>
                        <p className="text-gray-600">
                          Check back soon for exciting style challenges!
                        </p>
                      </div>
                    ) : (
                      challenges.map(challenge => (
                        <StyleChallengeCard 
                          key={challenge.id} 
                          challenge={challenge} 
                          onJoin={() => handleJoinChallenge(challenge.id)} 
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <CommunityLeaderboard users={trendingUsers} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
        onSubmit={handleCreatePost}
        wardrobeItems={items}
        challenges={challenges}
      />
    </div>
  );
};

export default CommunityPage;