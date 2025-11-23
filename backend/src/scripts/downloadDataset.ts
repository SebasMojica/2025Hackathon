// Re-export from downloadKaggleDataset
export { downloadKaggleClothingDataset as downloadDataset } from './downloadKaggleDataset';

// Run if called directly
import { downloadKaggleClothingDataset } from './downloadKaggleDataset';

if (require.main === module) {
  downloadKaggleClothingDataset()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error downloading dataset:', error);
      process.exit(1);
    });
}
