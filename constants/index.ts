import partlyCloudyImage from '../assets/images/partlycloudy.png';
import moderateRainImage from '../assets/images/moderaterain.png';
import sunImage from '../assets/images/sun.png';
import cloudImage from '../assets/images/cloud.png';
import heavyRainImage from '../assets/images/heavyrain.png';

export const apiKey = process.env.API_KEY;
interface WeatherImages {
    [key: string]: any;
  }
  
export const weatherImages : WeatherImages = {
    'partly cloudy': partlyCloudyImage,
    'poderate rain': moderateRainImage,
    'patchy rain possible': moderateRainImage,
    'patchy rain nearby': moderateRainImage,
    'sunny': sunImage,
    'clear': sunImage,
    'overcast': cloudImage,
    'cloudy': cloudImage,
    'light rain': moderateRainImage,
    'moderate rain at times': moderateRainImage,
    'heavy rain': heavyRainImage,
    'heavy rain at times': heavyRainImage,
    'moderate or heavy freezing rain': heavyRainImage,
    'moderate or heavy rain shower': heavyRainImage,
    'moderate or heavy rain with thunder': heavyRainImage,
    'other': moderateRainImage
};
