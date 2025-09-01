import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 文章分类信息 */
export interface ArticleCategory {
          id: number; // 主键
          categoryName: string; // 分类目录名称
          sortOrder: number; // 排序
  }

// 文章分类 API
export const ArticleCategoryApi = {
  // 查询文章分类分页
  getArticleCategoryPage: async (params?: any) => {
    return await request.get({ url: `/gamer/article-category/page`, params })
  },

  // 查询文章分类详情
  getArticleCategory: async (id: number) => {
    return await request.get({ url: `/gamer/article-category/get?id=` + id })
  },

  // 新增文章分类
  createArticleCategory: async (data: ArticleCategory) => {
    return await request.post({ url: `/gamer/article-category/create`, data })
  },

  // 修改文章分类
  updateArticleCategory: async (data: ArticleCategory) => {
    return await request.put({ url: `/gamer/article-category/update`, data })
  },

  // 删除文章分类
  deleteArticleCategory: async (id: number) => {
    return await request.delete({ url: `/gamer/article-category/delete?id=` + id })
  },

  /** 批量删除文章分类 */
  deleteArticleCategoryList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/article-category/delete-list?ids=${ids.join(',')}` })
  },

  // 导出文章分类 Excel
  exportArticleCategory: async (params) => {
    return await request.download({ url: `/gamer/article-category/export-excel`, params })
  }
}