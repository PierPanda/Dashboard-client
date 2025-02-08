import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoices | Acme Dashboard',
};


export default async function Page(props: {
  searchParams?: Promise<{
    // query and page are optional et seront des strings (string | undefined)
    query?: string;
    page?: string;
  }>;
}) {
  //On attend la promesse de searchParams
  const searchParams = await props.searchParams;
  //On récupère la query de searchParams (s'il y en a une)
  const query = searchParams?.query || '';
  //On récupère la page de searchParams (s'il y en a une) et on la convertit en nombre
  const currentPage = Number(searchParams?.page) || 1;
  // On récupère le nombre total de pages
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      {/*Suspense permet de gérer le chargement de la page en fonction de la recherche */}
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
      {/*On transmet le nombre total de pages au composant Pagination */}
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
