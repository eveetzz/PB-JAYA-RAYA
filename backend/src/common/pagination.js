export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_MAX_LIMIT = 100;

export function parseOffsetPagination(query = {}, config = {}) {
  const maxLimit = config.maxLimit ?? DEFAULT_MAX_LIMIT;
  const defaultSort = config.defaultSort ?? "createdAt";
  const defaultOrder = config.defaultOrder ?? "desc";
  const sortableFields = config.sortableFields ?? [defaultSort];

  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);

  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    maxLimit,
  );

  const skip = (page - 1) * limit;

  const sort = sortableFields.includes(query.sort) ? query.sort : defaultSort;

  const order = query.order === "asc" ? "asc" : "desc";

  return {
    page,
    limit,
    skip,
    sort,
    order,
  };
}

export function buildOffsetPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
