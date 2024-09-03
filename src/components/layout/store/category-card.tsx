export default function CategoryCard({ title, image, link }) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 hover:shadow-lg transition-shadow">
        <img src={image} alt={title} className="w-32 h-32 object-cover rounded-full" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <a href={link} className="mt-2 text-blue-500 hover:underline">
          Ver mais
        </a>
      </div>
    );
  }
  