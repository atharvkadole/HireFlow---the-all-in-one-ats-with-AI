const DEFAULT_PAGE_SIZE = 1000;

export const fetchSupabasePages = async (createQuery, pageSize = DEFAULT_PAGE_SIZE) => {
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await createQuery(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
};
