export const getAvatarUrl = (avatarUrl, seed = 'user') => {
  if (!avatarUrl) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  // Prepend backend origin (port 5000) for relative upload paths
  return `http://localhost:5000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
};
