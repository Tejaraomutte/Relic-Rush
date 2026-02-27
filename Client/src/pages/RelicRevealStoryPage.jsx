import React from 'react';

export default function RelicRevealStoryPage() {
  // Lazy import to avoid circular import issues
  const RelicRevealStory = React.lazy(() => import('../components/RelicRevealStory'));
  return (
    <React.Suspense fallback={<div style={{color:'#FFD700',textAlign:'center',marginTop:'20vh'}}>Loading...</div>}>
      <RelicRevealStory onBackToScore={() => window.history.back()} />
    </React.Suspense>
  );
}
