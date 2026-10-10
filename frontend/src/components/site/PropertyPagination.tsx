export const PROPERTIES_PER_PAGE = 20;

export function PropertyPagination({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const lastPage = Math.max(0, Math.ceil(total / PROPERTIES_PER_PAGE) - 1);
  const button = "rounded-md border border-border px-3 py-2 text-sm font-bold text-navy disabled:opacity-50";

  return (
    <nav aria-label="Property table pagination" className="my-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" role="status">
        {total === 0 ? "0 properties" : `${page * PROPERTIES_PER_PAGE + 1}-${Math.min((page + 1) * PROPERTIES_PER_PAGE, total)} of ${total} properties`}
        {" "} | Page {page + 1} of {lastPage + 1}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={page === 0} onClick={() => onPageChange(0)}>First</button>
        <button type="button" className={button} disabled={page === 0} onClick={() => onPageChange(page - 1)}>Previous</button>
        <button type="button" className={button} disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>Next</button>
        <button type="button" className={button} disabled={page >= lastPage} onClick={() => onPageChange(lastPage)}>Last</button>
      </div>
    </nav>
  );
}
