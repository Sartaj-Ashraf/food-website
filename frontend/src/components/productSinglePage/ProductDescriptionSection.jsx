export function ProductDescriptionSection({ description }) {
    return (
      <div className="bg-white mt-8">
        <div className="px-4 py-8">
          <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-6">Description</h2>
          <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full mt-2 flex-shrink-0"></div>
              </div>
          </div>
        </div>
      </div>
    )
  }