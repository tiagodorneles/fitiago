import {
  onMounted,
  onUnmounted,
} from 'vue'

export function useInfiniteScroll(loadMore: () => void, threshold = 200) {
  // Scroll detection for infinite scroll
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.offsetHeight

    // Trigger load more when user is within threshold pixels from the bottom
    if (scrollTop + windowHeight >= documentHeight - threshold) {
      loadMore()
    }
  }

  // Setup scroll listener
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    handleScroll,
  }
}
