/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class ErroesService extends Service {

    // 获得ERROR类型列表
    async getAverageErrorList(ctx) {
        const query = ctx.request.query;
        const appId = query.appId;
        let type = query.type;
        let pageNo = query.pageNo || 1;
        let pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const url = query.url;
        const city = query.city;
        const isCity = query.isCity;
        const isBrowser = query.isBrowser;
        const isSystem = query.isSystem;

        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        // 查询参数拼接
        const queryjson = { $match: { app_id: appId }, }
        if (type) queryjson.$match.category = type;
        if (url) queryjson.$match.resource_url = { $regex: new RegExp(url, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = {
            resourceurl: "$resource_url",
            category: "$category",
            msg: "$msg",
        };

        // 请求总条数
        const count = await this.ctx.model.Web.WebErrors.aggregate([
            queryjson,
            {
                $group: {
                    _id: group_id,
                    count: { $sum: 1 },
                }
            },
        ]).exec();
        const datas = await this.ctx.model.Web.WebErrors.aggregate([
            queryjson,
            {
                $group: {
                    _id: group_id,
                    count: { $sum: 1 },
                }
            },
            { $skip: (pageNo - 1) * pageSize },
            { $limit: pageSize },
            { $sort: { count: -1 } },
        ]).exec();

        return {
            datalist: datas,
            totalNum: count.length,
            pageNo: pageNo,
        };
    }

    // 获得单个Error列表
    async getOneErrorList(appId, url, category, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { app_id: appId, resource_url: url, category: category }

        // 请求总条数
        const count = await this.ctx.model.Web.WebErrors.aggregate([
            { $match: query, },
        ]).exec();
        // 列表信息
        const datas = await this.ctx.model.Web.WebErrors.aggregate([
            { $match: query, },
            { $skip: (pageNo - 1) * pageSize },
            { $limit: pageSize },
            { $sort: { count: -1 } },
        ]).exec();


        return {
            datalist: datas,
            totalNum: count.length,
            pageNo: pageNo,
        };
    }

    // 单个error详情信息
    async getErrorDetail(appId, markPage) {
        return await this.ctx.model.Web.WebErrors.findOne({ app_id: appId, mark_page: markPage }).exec() || {};
    }

}

module.exports = ErroesService;