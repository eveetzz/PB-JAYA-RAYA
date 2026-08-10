import {
  parseOffsetPagination,
  buildOffsetPaginationMeta,
} from "./pagination.js";

export function createOffsetListService({
  config,
  buildWhere,
  findMany,
  countMany,
}) {
  return async function listService(query = {}) {
    const { page, limit, skip, sort, order } = parseOffsetPagination(
      query,
      config,
    );

    const where = buildWhere(query);

    const [data, total] = await Promise.all([
      findMany({
        where,
        skip,
        limit,
        sort,
        order,
      }),
      countMany({
        where,
      }),
    ]);

    return {
      data,
      meta: buildOffsetPaginationMeta({
        page,
        limit,
        total,
      }),
    };
  };
}
