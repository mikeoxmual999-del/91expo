import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default function CompanyDetailPage({ params }: Props) {
  const company = {
    id: params.id,
    name: '北京科技发展有限公司',
    industry: '信息技术',
    region: '北京市',
  };

  const cases = [
    {
      id: '1',
      type: '合同纠纷',
      amount: '50万 – 100万',
      status: '审理中',
      date: '2024-12-01',
    },
    {
      id: '2',
      type: '劳动争议',
      amount: '10万以下',
      status: '已结案',
      date: '2024-10-15',
    },
  ];

  const statusColor: Record<string, string> = {
    审理中: 'bg-yellow-100 text-yellow-700',
    已结案: 'bg-green-100 text-green-700',
    二审阶段: 'bg-blue-100 text-blue-700',
  };

  return (
    <main className="pt-16 min-h-screen bg-[#F5F7FA] text-[#1F2937]">

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Back */}
        <div className="mb-6">
          <Link href="/search" className="text-sm text-blue-600 hover:underline">
            ← 返回查询结果
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-6">
          企业争议记录
        </h1>

        {/* Company Info */}
        <div className="bg-white border rounded-lg px-6 py-5 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{company.name}</h2>

          <div className="flex gap-10 text-sm text-gray-600">
            <div>
              <span className="text-gray-400 mr-2">行业</span>
              <span>{company.industry}</span>
            </div>

            <div>
              <span className="text-gray-400 mr-2">地区</span>
              <span>{company.region}</span>
            </div>

            <div>
              <span className="text-gray-400 mr-2">争议总数</span>
              <span className="font-semibold text-blue-600">
                {cases.length} 条
              </span>
            </div>
          </div>
        </div>

        {/* Case List */}
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">

          <div className="px-6 py-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700">
              争议案件列表
            </h3>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">案件编号</th>
                <th className="px-6 py-3 text-left">类型</th>
                <th className="px-6 py-3 text-left">金额</th>
                <th className="px-6 py-3 text-left">状态</th>
                <th className="px-6 py-3 text-left">更新时间</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 font-mono text-xs text-gray-700">
                    {c.id}
                  </td>

                  <td className="px-6 py-4">{c.type}</td>

                  <td className="px-6 py-4">{c.amount}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {c.date}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>

    </main>
  );
}