#!/usr/bin/env python
# coding=utf-8

from flask import (
    jsonify,
    request,
)
from flask.views import MethodView

import utils.common
from main import db
from apps.fish import db_utils
from apps.fish.models import Record


class Index(MethodView):
    def get(self):
        data = {}
        articles = db_utils.article(page=1)
        data['articles'] = articles
        data['next_page'] = 2
        return jsonify(data)


class More(MethodView):
    def get(self):
        next_page = request.args.get('next_page')
        try:
            next_page = int(next_page)
        except ValueError:
            return '', 400
        articles = db_utils.article(page=next_page)

        if not articles:
            return jsonify({})
        data = {
            'articles': articles,
            'next_page': next_page + 1,
        }
        return jsonify(data)


class Article(MethodView):
    def get(self, record_id):
        article = Record.query.filter_by(record_id=record_id).first()
        if not article:
            return utils.common.raise_error(status_code=404)
        # 兼容以前的数据
        if not article.views:
            article.views = 0
        # 更新浏览次数
        article.views += 1
        db.session.add(article)
        db.session.commit()
        article_data = article.json
        data = {
            'article': article_data,
        }
        return jsonify(data)
