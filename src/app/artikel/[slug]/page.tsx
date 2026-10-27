'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { ContentLayout } from '@/components/panel/content-layout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { Eye, Share2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import DOMPurify from 'isomorphic-dompurify'

export default function BlogDetailPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug

  const { data: detailData, isLoading: loadingDetail, error } = useSWR(
    slug ? `/api/blog/${slug}` : null,
    fetcher
  )

  const { data: listData, isLoading: loadingList } = useSWR(
    '/api/blog',
    fetcher
  )

  if (loadingDetail) {
    return (
      <ContentLayout title="Artikel">
        <div className="h-[80vh] flex justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    )
  }

  if (error) {
    return (
      <ContentLayout title="Artikel">
        <div className="text-center py-20 text-red-500">
          Gagal memuat artikel
        </div>
      </ContentLayout>
    )
  }

  const blog = detailData?.blog

  if (!blog) {
    return (
      <ContentLayout title="Artikel">
        <div className="text-center py-20">Artikel tidak ditemukan.</div>
      </ContentLayout>
    )
  }

  const allBlogs = listData?.blogs || []
  const recent = allBlogs
    .filter((b: any) => b.slug !== slug)
    .slice(0, 5)

  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  const formatDate = (date: string) => {
    if (!date) return '-'
    const d = new Date(date)
    return isNaN(d.getTime()) ? '-' : format(d, 'dd MMM yyyy')
  }

  const fallbackImage = '/placeholder.jpg'

  const shareTo = (platform: string) => {
    let url = ''

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(currentUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title + ' ' + currentUrl)}`
        break
      case 'copy':
        navigator.clipboard.writeText(currentUrl)
        return
      default:
        return
    }

    window.open(url, '_blank')
  }

  return (
    <ContentLayout title={blog.title}>
      <div className="relative pt-4 pb-8">
        <div className="container w-full mx-auto px-2 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* MAIN */}
            <div className="flex-1 lg:w-2/3 space-y-6">
              <div className="text-sm text-muted-foreground">
                <Link href="/artikel">Articles</Link> / {blog.title}
              </div>

              <div className="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-my-color3 text-white">
                {blog.category || 'Game News'}
              </div>

              <h1 className="text-lg lg:text-3xl font-bold">
                {blog.title}
              </h1>

              <div className="text-sm text-muted-foreground flex gap-4">
                <div className="flex gap-2">
                  <span>{blog.author || 'Admin'}</span>
                  <span>•</span>
                  <span>{formatDate(blog.published_at)}</span>
                </div>

                <span className="flex gap-1">
                  <Eye className="w-4 h-4" />
                  {blog.views}
                </span>
              </div>

              {/* IMAGE */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                <Image
                  src={blog.image || fallbackImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT (SAFE) */}
              <article
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(blog.content),
                }}
              />

              {/* SHARE */}
              <div className="mt-10 border-t pt-6">
                <h2 className="text-lg font-semibold flex gap-2 mb-4">
                  <Share2 className="w-5 h-5" /> Bagikan Artikel Ini
                </h2>

                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => shareTo('facebook')}>Facebook</button>
                  <button onClick={() => shareTo('twitter')}>Twitter</button>
                  <button onClick={() => shareTo('linkedin')}>LinkedIn</button>
                  <button onClick={() => shareTo('whatsapp')}>WhatsApp</button>
                  <button onClick={() => shareTo('copy')}>
                    <LinkIcon className="w-4 h-4 inline" /> Copy
                  </button>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:w-1/3">
              <div className="sticky top-28 space-y-4">
                <h3 className="text-lg font-bold">Artikel Terbaru</h3>

                {loadingList ? (
                  <LoadingSpinner size={24} />
                ) : (
                  recent.map((post: any) => (
                    <motion.div key={post.id}>
                      <Link href={`/artikel/${post.slug}`}>
                        <div className="flex gap-4">
                          <div className="relative w-[140px] h-[150px]">
                            <Image
                              src={post.image || fallbackImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h2 className="text-sm">{post.title}</h2>
                            <span className="text-xs">
                              {formatDate(post.published_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ContentLayout>
  )
}