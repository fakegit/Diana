#!/usr/bin/env python
# coding=utf-8

import json
import random

import utils.db
import utils.tags
import utils.auth
import utils.common
import utils.json_utils

import config
from db.sa import Session

from apps.model import (
    Tag,
    User,
    Article as ArticleModel,
)

from apps.base import BaseHandler


class Index(BaseHandler):
    def get(self):
        data = {}
        data['bg'] = random.choice(config.INDEX_BG)
        session = Session()
        data['last_article'] = session.query(User).filter(
            User.user_id == config.USER_ID
        ).first().article[0]
        if data['last_article']:
            data['last_article'] = data['last_article'].to_json()
        session.commit()
        session.close()

        articles = utils.db.article(page=1, user_id=config.USER_ID)
        # articles = utils.tags.articles_add_tags(articles)
        user = utils.db.user(user_id=config.USER_ID)
        data['articles'] = articles
        data['user'] = user
        data['next_page'] = 2
        self.render('index.html', data=data)


class More(BaseHandler):
    def get(self):
        next_page = self.get_argument('next_page')
        page = self.get_argument('page')
        tag = self.get_argument('tag')

        articles = None
        if page == 'index':
            articles = utils.db.article(page=next_page, user_id=config.USER_ID)
        elif page == 'tag':
            articles = utils.db.tag_articles(
                tag=tag, page=next_page, user_id=config.USER_ID
            )

        if not articles:
            return self.write('')
        # articles = utils.tags.articles_add_tags(articles)
        data = {}
        data['articles'] = articles
        article_list = self.render_string('article_list.html', data=data)
        ret = {
            'next_page': int(next_page) + 1,
            'data': article_list
        }
        self.write(ret)


class Article(BaseHandler):
    def get(self, article_id):
        session = Session()
        article = session.query(ArticleModel).filter(
            ArticleModel.article_id == article_id,
            ArticleModel.user_id == config.USER_ID
        ).first()
        if not article:
            return utils.common.raise_error(request=self, status_code=404)
        # 兼容以前的数据
        if not article.views:
            article.views = 0
        # 更新浏览次数
        article.views += 1
        session.add(article)
        session.commit()
        article = article.to_json()
        session.close()
        user = utils.db.user(user_id=config.USER_ID)
        data = {}
        data['article'] = article
        data['user'] = user
        self.render('article.html', data=data)


class Edit(BaseHandler):
    @utils.auth.login_require
    def get(self, article_id):
        data = {}
        session = Session()
        article = session.query(ArticleModel).filter(
            ArticleModel.article_id == article_id,
            ArticleModel.user_id == self.user_id
        ).first()
        if article:
            article = article.to_json()
            data['article_markdown_content'] = article['markdown_content']
            data['article_title'] = article['title']
        else:
            data['article_markdown_content'] = ''
            data['article_title'] = ''
        data['article_id'] = article_id
        session.commit()
        session.close()
        self.render('editor.html', data=data)

    @utils.auth.login_require
    def post(self, article_id):
        article_id = int(article_id)
        title = self.get_argument('title')
        introduction = self.get_argument('introduction')
        markdown_content = self.get_argument('markdown_content')
        compiled_content = self.get_argument('compiled_content')
        tags = self.get_argument('tags')
        tags = json.loads(tags)

        session = Session()
        user = session.query(User).filter(
            User.user_id == self.user_id
        ).first()
        article = session.query(ArticleModel).filter(
            ArticleModel.article_id == article_id,
            ArticleModel.user_id == self.user_id
        ).first()
        if article:
            article.title = title
            article.introduction = introduction
            article.markdown_content = markdown_content
            article.compiled_content = compiled_content
        else:
            article = ArticleModel(
                user_id=self.user_id,
                title=title,
                introduction=introduction,
                markdown_content=markdown_content,
                compiled_content=compiled_content,
            )

        # 文章标签更新方法：先把以前的全部删除再全部新建
        article.tag[:] = []
        for tag in tags:
            tag = utils.db.get_or_create(session, Tag, content=tag)
            article.tag.append(tag)
            user.tag.append(tag)
        session.add(user)
        session.add(article)
        session.commit()
        session.close()
