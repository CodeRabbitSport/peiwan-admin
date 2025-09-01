import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 文章信息 */
export interface Article {
          id: number; // 主键
          articleTitle: string; // 文章标题
          articleDesc: string; // 文章简介
          articleContent: string; // 文章内容
          articleHideContent: string; // 文章隐藏内容
          hideActiveType: number; // 隐藏内容获取方式(1所有人可见2登录用户可见3下过单的用户可见4累计金额消费过x元5累计下单超过x次)
          hideActiveCount: number; // 隐藏方式为4或5的计数
          cover: string; // 封面图
          sortOrder: number; // 排序
          categoryId?: number; // 分类ID
  }

// 文章 API
export const ArticleApi = {
  // 查询文章分页
  getArticlePage: async (params?: any) => {
    return await request.get({ url: `/gamer/article/page`, params })
  },

  // 查询文章详情
  getArticle: async (id: number) => {
    return await request.get({ url: `/gamer/article/get?id=` + id })
  },

  // 新增文章
  createArticle: async (data: Article) => {
    return await request.post({ url: `/gamer/article/create`, data })
  },

  // 修改文章
  updateArticle: async (data: Article) => {
    return await request.put({ url: `/gamer/article/update`, data })
  },

  // 删除文章
  deleteArticle: async (id: number) => {
    return await request.delete({ url: `/gamer/article/delete?id=` + id })
  },

  /** 批量删除文章 */
  deleteArticleList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/article/delete-list?ids=${ids.join(',')}` })
  },

  // 导出文章 Excel
  exportArticle: async (params) => {
    return await request.download({ url: `/gamer/article/export-excel`, params })
  }
}