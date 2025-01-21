import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from 'prop-types';

const LazyTable = ({
    columns,
    fetchData,
    rowsPerPage = 10,
    className = "",
    headerClassName = "",
    rowClassName = "",
    cellClassName = ""
  }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [cache, setCache] = useState(new Map());
  
    const loadData = useCallback(
        async (pageNum) => {
          setLoading(true);
      
          // Check if data is cached
          if (cache.has(pageNum)) {
            setData(cache.get(pageNum));
            setLoading(false);
            return;
          }
      
          try {
            const result = await fetchData(pageNum, rowsPerPage);
      
            if (result?.data) {
              // Update cache
              setCache((prevCache) => {
                const newCache = new Map(prevCache);
                newCache.set(pageNum, result.data);
                return newCache;
              });
      
              // Update component state
              setData(result.data);
              setTotalCount(result.totalCount);
      
              // Prefetch next page
              const nextPage = pageNum + 1;
              if (nextPage <= Math.ceil(result.totalCount / rowsPerPage) && !cache.has(nextPage)) {
                const nextResult = await fetchData(nextPage, rowsPerPage);
                if (nextResult?.data) {
                  setCache((prevCache) => {
                    const newCache = new Map(prevCache);
                    newCache.set(nextPage, nextResult.data);
                    return newCache;
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error loading data:", error);
          } finally {
            setLoading(false);
          }
        },
        [fetchData, rowsPerPage, cache, setCache]
      );
      
      useEffect(() => {
        loadData(page);
      }, [page, loadData]);
    
      const handlePageChange = (newPage) => {
        if (newPage !== page) {
          setPage(newPage);
        }
      };
    
      const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div>
      <Table className={className}>
        <TableHeader>
          <TableRow> 
            {/* set up the headers for the table */}
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={`${headerClassName} font-body h-12`}
                style={{
                  width: column.width,
                  maxWidth: column.width,
                }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-base font-body h-28">
                Loading...
              </TableCell>
            </TableRow>
          ) : data && data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index} className={rowClassName}>
                {columns.map((column) => (
                  <TableCell 
                    key={column.key} 
                    className={`${cellClassName} h-auto py-4 px-6`}
                    style={{
                      width: column.width,
                      maxWidth: column.width,
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word'
                    }}
                  >
                    {row[column.key] !== undefined ? row[column.key] : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center font-body h-16">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 0 && (
        <div className="flex items-center justify-center space-x-2 py-4 mb-4 pr-4">
          <button
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-violet-400 hover:text-rose-400"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <span className="text-violet-400">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-violet-400 hover:text-rose-400"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        </div>
      )}
    </div>
  );
};

LazyTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired
  })).isRequired,
  fetchData: PropTypes.func.isRequired,
  rowsPerPage: PropTypes.number,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  cellClassName: PropTypes.string
};

export default LazyTable;