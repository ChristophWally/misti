import MigrationTestPanel from '../../../components/admin/MigrationTestPanel'

export default function MigrationTestingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Migration Testing</h1>
        <p className="text-gray-600 mt-2">
          Test Story 002.003 migration infrastructure against your database
        </p>
      </div>
      
      <MigrationTestPanel />
    </div>
  )
}
