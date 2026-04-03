// 🔥 use globalThis to persist between reloads

const globalAny = globalThis as any;

if (!globalAny.casesStore) {
  globalAny.casesStore = [];
}

export async function GET() {
  return Response.json(globalAny.casesStore);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newCase = {
    id: Date.now().toString(),
    ...body,
    status: '待回应',
    date: new Date().toLocaleDateString(),
  };

  globalAny.casesStore.unshift(newCase);

  console.log('STORE:', globalAny.casesStore);

  return Response.json(newCase);
}