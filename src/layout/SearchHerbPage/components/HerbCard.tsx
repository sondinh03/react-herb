import { Link } from 'react-router-dom';
import { PlantResponseDto, viewPlant } from '../../../models/PlantService';

interface HearCardProps {
  plants: PlantResponseDto[];
  loading: boolean;
}

export const HerbCard = ({ plants, loading }: HearCardProps) => {
  // Handle plant card click
  const handlePlantClick = async (id: number, event: React.MouseEvent) => {
    try {
      // Call the viewPlant API
      const plantData = await viewPlant(id);

      // You can store this data in state management (Redux, Context) or
      // simply use React Router's state to pass data to the detail page
      // No need to prevent default as we still want the Link to navigate

      // Optional: You can log the data or perform other actions
      console.log('Plant data fetched:', plantData);
    } catch (error) {
      console.error('Failed to fetch plant details:', error);
      // Optionally prevent navigation if API call fails
      // event.preventDefault();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 w-full h-40"></div>
            <div className="bg-gray-200 h-4 w-3/4 mt-2 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy dược liệu phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {plants.map((plant) => (
        <Link
          to={`/plants/${plant.id}`}
          key={plant.id}
          className="text-center hover:shadow-md transition-shadow duration-300"
          onClick={(e) => handlePlantClick(plant.id, e)}
        >
          <img
            // src={plant.image || `api/files/view/${plant.avatarId}` || '/api/placeholder/200/150'}
            src={plant.image || ''}
            alt={plant.vietnameseName}
            className="w-full h-40 object-cover border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/200/150';
            }}
          />
          <div className="text-green-700 mt-2 font-medium">
            {plant.vietnameseName}
          </div>
          {plant.scientificName && (
            <div className="text-gray-500 text-sm italic">
              {plant.scientificName}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
