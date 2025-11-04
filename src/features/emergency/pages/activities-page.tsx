import { Clock } from 'lucide-react';
import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/emergency/components/ui/tabs';
import { Card, CardFooter } from '@/features/emergency/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/features/emergency/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/emergency/components/ui/select';

export default function ActivitiesPage() {
  const mockData = Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    img: null,
    value: String.fromCharCode(65 + i),
  }));

  const COM = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    img: null,
    value: String.fromCharCode(97 + i),
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const rowsOptions = [5, 10, 20];

  const totalPages = Math.ceil(mockData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = mockData.slice(startIndex, startIndex + rowsPerPage);
  const currentCom = COM.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Clock size={32} />
        <h1 className="text-3xl font-bold">Activities</h1>
      </div>

      <Tabs defaultValue="Ongoing" className="w-full">
        <TabsList>
          <TabsTrigger value="Ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="Complete">Complete</TabsTrigger>
        </TabsList>

        {/* Ongoing Tab */}
        <TabsContent value="Ongoing">
          {currentItems.map((item) => (
            <div key={item.id} className="py-3">
              <Card className="p-4">
                {item.img ?? '🖼️ No Image'} — {item.value}
              </Card>
            </div>
          ))}

          {/* Pagination footer */}
          <CardFooter className="w-full items-center justify-between pt-6">
            {/* Left: Rows per page */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground w-25 text-sm">
                Rows per page
              </span>
              <Select
                onValueChange={(val) => handleRowsChange(Number(val))}
                defaultValue={String(rowsPerPage)}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={String(rowsPerPage)} />
                </SelectTrigger>
                <SelectContent>
                  {rowsOptions.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Pagination controls */}
            <Pagination>
              <PaginationContent className="flex items-center space-x-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {/* Pagination numbers with ellipsis */}
                {(() => {
                  const pagesToShow: (number | string)[] = [];
                  const showEllipsis = totalPages > 7;

                  if (!showEllipsis) {
                    // Show all pages if totalPages <= 7
                    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
                  } else {
                    // Always show first and last page
                    pagesToShow.push(1);

                    // Determine start and end range around currentPage
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    // Add ellipsis if there’s a gap after the first page
                    if (start > 2) pagesToShow.push('...');

                    // Add middle range
                    for (let i = start; i <= end; i++) pagesToShow.push(i);

                    // Add ellipsis if there’s a gap before the last page
                    if (end < totalPages - 1) pagesToShow.push('...');

                    // Add last page
                    pagesToShow.push(totalPages);
                  }

                  return pagesToShow.map((page, i) => (
                    <PaginationItem key={i}>
                      {page === '...' ? (
                        <span className="text-muted-foreground px-2">...</span>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </TabsContent>

        {/* Complete Tab (reuse layout if needed) */}
        <TabsContent value="Complete">
          {currentCom.map((item) => (
            <div key={item.id} className="py-3">
              <Card className="p-4">
                {item.img ?? '🖼️ No Image'} — {item.value}
              </Card>
            </div>
          ))}

          {/* Pagination footer */}
          <CardFooter className="items-center justify-between">
            {/* Left: Rows per page */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground w-25 text-sm">
                Rows per page
              </span>
              <Select
                onValueChange={(val) => handleRowsChange(Number(val))}
                defaultValue={String(rowsPerPage)}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={String(rowsPerPage)} />
                </SelectTrigger>
                <SelectContent>
                  {rowsOptions.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Pagination controls */}
            <Pagination className="flex items-center justify-center gap-2">
              <PaginationContent className="items-center space-x-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {/* Pagination numbers with ellipsis */}
                {(() => {
                  const pagesToShow: (number | string)[] = [];
                  const showEllipsis = totalPages > 7;

                  if (!showEllipsis) {
                    // Show all pages if totalPages <= 7
                    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
                  } else {
                    // Always show first and last page
                    pagesToShow.push(1);

                    // Determine start and end range around currentPage
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    // Add ellipsis if there’s a gap after the first page
                    if (start > 2) pagesToShow.push('...');

                    // Add middle range
                    for (let i = start; i <= end; i++) pagesToShow.push(i);

                    // Add ellipsis if there’s a gap before the last page
                    if (end < totalPages - 1) pagesToShow.push('...');

                    // Add last page
                    pagesToShow.push(totalPages);
                  }

                  return pagesToShow.map((page, i) => (
                    <PaginationItem key={i}>
                      {page === '...' ? (
                        <span className="text-muted-foreground px-2">...</span>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </div>
  );
}
