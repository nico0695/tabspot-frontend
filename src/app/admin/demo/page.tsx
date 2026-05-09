'use client';

import { useState, useCallback } from 'react';
import * as z from 'zod';
import { createColumnHelper } from '@tanstack/react-table';
import { FormBuilder, type FieldConfig } from '@/components/crud/FormBuilder';
import { DataTable, type ActionConfig, type SortDirection } from '@/components/crud/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import styles from './page.module.css';

// ---- Form Demo ----

const genreSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  slug: z.string().min(1, 'El slug es obligatorio'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  difficulty: z.string().optional(),
});

type GenreForm = z.infer<typeof genreSchema>;

const genreFields: FieldConfig<GenreForm>[] = [
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Ej: Rock',
    hint: 'Nombre del género musical',
  },
  { name: 'slug', label: 'Slug', type: 'text', placeholder: 'ej: rock' },
  {
    name: 'difficulty',
    label: 'Dificultad por defecto',
    type: 'select',
    options: [
      { value: 'BEGINNER', label: 'Principiante' },
      { value: 'INTERMEDIATE', label: 'Intermedio' },
      { value: 'ADVANCED', label: 'Avanzado' },
    ],
    placeholder: 'Seleccionar...',
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Descripción del género...',
    colSpan: 2,
  },
  { name: 'isActive', label: 'Activo', type: 'toggle' },
];

// ---- Table Demo ----

interface DemoGenre {
  id: string;
  name: string;
  slug: string;
  status: 'published' | 'draft' | 'pending';
  songsCount: number;
  createdAt: string;
}

const DEMO_DATA: DemoGenre[] = [
  {
    id: '1',
    name: 'Rock',
    slug: 'rock',
    status: 'published',
    songsCount: 142,
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Blues',
    slug: 'blues',
    status: 'published',
    songsCount: 87,
    createdAt: '2026-01-20',
  },
  { id: '3', name: 'Jazz', slug: 'jazz', status: 'draft', songsCount: 23, createdAt: '2026-02-01' },
  {
    id: '4',
    name: 'Folk',
    slug: 'folk',
    status: 'pending',
    songsCount: 56,
    createdAt: '2026-02-10',
  },
  {
    id: '5',
    name: 'Metal',
    slug: 'metal',
    status: 'published',
    songsCount: 198,
    createdAt: '2026-03-05',
  },
  {
    id: '6',
    name: 'Reggae',
    slug: 'reggae',
    status: 'draft',
    songsCount: 34,
    createdAt: '2026-03-12',
  },
  {
    id: '7',
    name: 'Country',
    slug: 'country',
    status: 'published',
    songsCount: 67,
    createdAt: '2026-04-01',
  },
  {
    id: '8',
    name: 'Bossa Nova',
    slug: 'bossa-nova',
    status: 'pending',
    songsCount: 15,
    createdAt: '2026-04-18',
  },
];

const columnHelper = createColumnHelper<DemoGenre>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Nombre',
    enableSorting: true,
  }),
  columnHelper.accessor('slug', {
    header: 'Slug',
    cell: (info) => <code className={styles.code}>{info.getValue()}</code>,
    enableSorting: false,
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: (info) => <Badge variant={info.getValue()}>{info.getValue()}</Badge>,
    enableSorting: true,
  }),
  columnHelper.accessor('songsCount', {
    header: 'Canciones',
    enableSorting: true,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Creado',
    enableSorting: true,
  }),
];

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function AdminDemoPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formResult, setFormResult] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<SortDirection | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const handleFormSubmit = useCallback(async (data: GenreForm) => {
    setFormLoading(true);
    setFormResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setFormLoading(false);
    setFormResult(JSON.stringify(data, null, 2));
  }, []);

  const handleSort = useCallback((col: string, dir: SortDirection) => {
    setSortBy(col);
    setSortDir(dir);
  }, []);

  const handleRefresh = useCallback(() => {
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 1000);
  }, []);

  const filteredData = search
    ? DEMO_DATA.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : DEMO_DATA;

  const pageSize = 5;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const actions: ActionConfig<DemoGenre>[] = [
    { label: 'Editar', icon: <EditIcon />, onClick: (row) => alert(`Editar: ${row.name}`) },
    {
      label: 'Eliminar',
      icon: <TrashIcon />,
      onClick: (row) => alert(`Eliminar: ${row.name}`),
      variant: 'danger',
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>CRUD Components Demo</h1>
      <p className={styles.subtitle}>Vista previa de FormBuilder y DataTable</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>FormBuilder</h2>
        <Card>
          <Card.Body>
            <FormBuilder
              schema={genreSchema}
              fields={genreFields}
              onSubmit={handleFormSubmit}
              loading={formLoading}
              submitLabel="Crear género"
              columns={2}
              defaultValues={{ isActive: true }}
            />
          </Card.Body>
        </Card>
        {formResult && (
          <Card>
            <Card.Header>
              <h3 className={styles.resultTitle}>Resultado del submit</h3>
            </Card.Header>
            <Card.Body>
              <pre className={styles.pre}>{formResult}</pre>
            </Card.Body>
          </Card>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>DataTable</h2>
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={tableLoading}
          actions={actions}
          sortBy={sortBy}
          sortDirection={sortDir}
          onSort={handleSort}
          searchValue={search}
          searchPlaceholder="Buscar género..."
          onSearchChange={setSearch}
          pagination={{
            page,
            pageSize,
            totalPages: Math.ceil(filteredData.length / pageSize),
            totalCount: filteredData.length,
          }}
          onPageChange={setPage}
          onRefresh={handleRefresh}
          emptyTitle="No se encontraron géneros"
          emptyDescription="Intentá con otro término de búsqueda"
        />
      </section>
    </div>
  );
}
