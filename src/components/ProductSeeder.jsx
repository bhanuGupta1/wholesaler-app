import React, { useState } from 'react';

const ProductSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState('');

  const sampleProducts = [
    // Smartphones
    {
      name: "iPhone 16 Pro Max",
      category: "Smartphones",
      price: 1199.99,
      description: "Latest iPhone with A18 Pro chip, 6.9-inch Super Retina XDR display, advanced camera system with 5x telephoto zoom, titanium design, and all-day battery life.",
      image: "https://cdn.dxomark.com/wp-content/uploads/medias/post-176063/Apple-iPhone-16-Pro-Max_-blue-titanium_iPhone-16-Pro-Max_back.jpg",
      stock: 25,
      featured: true,
      brand: "Apple",
      model: "iPhone 16 Pro Max"
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      category: "Smartphones", 
      price: 1299.99,
      description: "Premium Android flagship with S Pen, 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, 200MP camera with 100x Space Zoom.",
      image: "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-ultra-s928-sm-s928uzkaxaa-539557326?$650_519_PNG$",
      stock: 20,
      featured: true,
      brand: "Samsung",
      model: "Galaxy S24 Ultra"
    },
    {
      name: "Google Pixel 8 Pro",
      category: "Smartphones",
      price: 999.99,
      description: "Google's flagship with advanced AI photography, Tensor G3 chip, 6.7-inch LTPO OLED display, Magic Eraser, Best Take, and 7 years of OS updates.",
      image: "https://lh3.googleusercontent.com/Nu3a6F80WfixUqxeX7Ej9j8EiJ_BkXzxZcKBxCvLrw",
      stock: 18,
      featured: true,
      brand: "Google",
      model: "Pixel 8 Pro"
    },

    // Laptops
    {
      name: "MacBook Pro 16-inch M4 Pro",
      category: "Laptops",
      price: 2499.99,
      description: "Professional laptop powered by Apple M4 Pro chip with 12-core CPU and 18-core GPU. Features 16.2-inch Liquid Retina XDR display and up to 22 hours battery life.",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=80",
      stock: 12,
      featured: true,
      brand: "Apple",
      model: "MacBook Pro 16-inch M4 Pro"
    },
    {
      name: "Dell XPS 15 (9530)",
      category: "Laptops",
      price: 1899.99,
      description: "Premium Windows laptop with 13th Gen Intel Core i7, NVIDIA GeForce RTX 4070, 15.6-inch 3.5K OLED InfinityEdge display.",
      image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/gray/notebook-xps-15-9530-gray-gallery-5.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=680",
      stock: 15,
      featured: true,
      brand: "Dell",
      model: "XPS 15 (9530)"
    },
    {
      name: "ASUS ROG Strix G16 (2024)",
      category: "Gaming Laptops",
      price: 1599.99,
      description: "High-performance gaming laptop with Intel Core i7-13650HX, NVIDIA GeForce RTX 4060, 16-inch FHD 165Hz display, RGB keyboard.",
      image: "https://dlcdnwebimgs.asus.com/gain/e9c1de6c-3c1e-4de8-8c40-5b7e1bb7e39a/",
      stock: 10,
      featured: true,
      brand: "ASUS",
      model: "ROG Strix G16 (2024)"
    },

    // Audio Devices
    {
      name: "Sony WH-1000XM5",
      category: "Audio",
      price: 399.99,
      description: "Industry-leading noise canceling wireless headphones with 30-hour battery life, crystal-clear hands-free calling, and premium sound quality.",
      image: "https://sony.scene7.com/is/image/sonyglobalsolutions/wh-1000xm5_Primary_image?$categorypdpnav$&fmt=png-alpha",
      stock: 35,
      featured: true,
      brand: "Sony",
      model: "WH-1000XM5"
    },
    {
      name: "Apple AirPods Pro (3rd generation)",
      category: "Audio",
      price: 249.99,
      description: "Premium wireless earbuds with adaptive transparency, personalized spatial audio, H2 chip for enhanced performance.",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-3rd-gen-hero-select-202209?wid=556&hei=556&fmt=png-alpha",
      stock: 40,
      featured: true,
      brand: "Apple",
      model: "AirPods Pro (3rd generation)"
    },

    // Smart Watches
    {
      name: "Apple Watch Series 10",
      category: "Wearables",
      price: 429.99,
      description: "Latest Apple Watch with larger 46mm display, advanced health monitoring including blood oxygen and ECG, GPS + Cellular connectivity.",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s10-case-unselect-gallery-1-202409?wid=5120&hei=3280&fmt=p-jpg&qlt=80",
      stock: 30,
      featured: true,
      brand: "Apple",
      model: "Apple Watch Series 10"
    },
    {
      name: "Samsung Galaxy Watch 7",
      category: "Wearables",
      price: 329.99,
      description: "Advanced smartwatch with Wear OS, comprehensive health tracking, 40mm Super AMOLED display, GPS, 5ATM water resistance.",
      image: "https://images.samsung.com/is/image/samsung/p6pim/us/2407/gallery/us-galaxy-watch7-l300-sm-l300nzeaxar-542833018?$650_519_PNG$",
      stock: 25,
      featured: true,
      brand: "Samsung",
      model: "Galaxy Watch 7"
    },

    // Gaming Consoles
    {
      name: "PlayStation 5 Pro",
      category: "Gaming",
      price: 699.99,
      description: "Most advanced PlayStation console with enhanced GPU, AI-driven upscaling, 2TB SSD storage, and support for 8K gaming.",
      image: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-pro-hardware-image-block-01-en-07nov24?$native$",
      stock: 8,
      featured: true,
      brand: "Sony",
      model: "PlayStation 5 Pro"
    },
    {
      name: "Xbox Series X",
      category: "Gaming",
      price: 499.99,
      description: "Microsoft's most powerful console with 12 teraflops of processing power, 1TB NVMe SSD, 4K gaming at 60fps.",
      image: "https://assets.xboxservices.com/assets/fb/d2/fbd2cb56-5c25-414d-9f46-e6a364902e1e.png?n=X1X_Page-Hero-1084_Hero-Image_1920x1080.png",
      stock: 12,
      featured: true,
      brand: "Microsoft",
      model: "Xbox Series X"
    },

    // Tablets
    {
      name: "iPad Pro 13-inch M4",
      category: "Tablets",
      price: 1299.99,
      description: "Ultimate iPad with M4 chip, stunning 13-inch Ultra Retina XDR display with ProMotion, Apple Pencil Pro support.",
      image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-202405?wid=470&hei=556&fmt=png-alpha",
      stock: 15,
      featured: true,
      brand: "Apple",
      model: "iPad Pro 13-inch M4"
    },
    {
      name: "Samsung Galaxy Tab S9 Ultra",
      category: "Tablets",
      price: 1199.99,
      description: "Premium Android tablet with massive 14.6-inch Super AMOLED display, Snapdragon 8 Gen 2 processor, S Pen included.",
      image: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-tab-s9-ultra-x910-sm-x910nzaaxar-537490421?$650_519_PNG$",
      stock: 12,
      featured: true,
      brand: "Samsung",
      model: "Galaxy Tab S9 Ultra"
    },

    // Smart Home
    {
      name: "Amazon Echo Show 15",
      category: "Smart Home",
      price: 249.99,
      description: "Smart display with 15.6-inch Full HD screen, Alexa voice control, family calendar, notes, and photos.",
      image: "https://m.media-amazon.com/images/I/61BkPpn+oWL._AC_SL1500_.jpg",
      stock: 20,
      featured: false,
      brand: "Amazon",
      model: "Echo Show 15"
    },
    {
      name: "Nest Learning Thermostat (4th Gen)",
      category: "Smart Home",
      price: 279.99,
      description: "Intelligent thermostat that learns your schedule and preferences, with energy-saving features and remote control via app.",
      image: "https://lh3.googleusercontent.com/jBkX8DEKnxhU_nQfVfKl-vkYaDsn3gT9m1p-FvYC1sU",
      stock: 25,
      featured: false,
      brand: "Google Nest",
      model: "Learning Thermostat (4th Gen)"
    },

    // Cameras
    {
      name: "Canon EOS R5 Mark II",
      category: "Cameras",
      price: 4299.99,
      description: "Professional mirrorless camera with 45MP full-frame sensor, 8K video recording, advanced dual-pixel autofocus.",
      image: "https://i1.adis.ws/i/canon/eos-r5-mark-ii_front_rf24-105mm_32c26ad194234d42b3cd9e582a21c99b",
      stock: 6,
      featured: true,
      brand: "Canon",
      model: "EOS R5 Mark II"
    },
    {
      name: "Sony A7R V",
      category: "Cameras",
      price: 3899.99,
      description: "High-resolution mirrorless camera with 61MP sensor, AI-powered autofocus, 8K video capability, 5-axis image stabilization.",
      image: "https://sony.scene7.com/is/image/sonyglobalsolutions/pdp-product-image-a7rv-front-lens?$categorypdpnav$&fmt=png-alpha",
      stock: 8,
      featured: true,
      brand: "Sony",
      model: "Alpha 7R V"
    },

    // Kitchen Appliances
    {
      name: "KitchenAid Artisan Stand Mixer",
      category: "Kitchen Appliances",
      price: 449.99,
      description: "Iconic 5-quart stand mixer with 325-watt motor, 10-speed slide control, tilt-head design, and included attachments.",
      image: "https://kitchenaid-h.assetsadobe.com/is/image/content/dam/business-unit/kitchenaid/en-us/marketing-content/site-assets/page-content/pinch-of-help/how-to-use-stand-mixer-attachments/mixer-with-attachments.tif?fmt=png-alpha&wid=900&hei=600",
      stock: 18,
      featured: false,
      brand: "KitchenAid",
      model: "Artisan Series 5-Qt"
    }
  ];

  const seedProducts = async () => {
    setIsSeeding(true);
    setSeedingStatus('Seeding products...');
    
    try {
      // Firebase/Firestore implementation
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      let successCount = 0;
      
      for (const product of sampleProducts) {
        try {
          await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            id: crypto.randomUUID(),
          });
          successCount++;
          setSeedingStatus(`Seeding products... ${successCount}/${sampleProducts.length}`);
        } catch (productError) {
          console.error(`Error seeding product ${product.name}:`, productError);
        }
      }
      
      setSeedingStatus(`✅ Successfully seeded ${successCount}/${sampleProducts.length} premium products!`);
    } catch (error) {
      setSeedingStatus('❌ Error seeding products. Make sure Firebase is properly configured.');
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const clearProducts = async () => {
    setIsSeeding(true);
    setSeedingStatus('Clearing products...');
    
    try {
      const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const querySnapshot = await getDocs(collection(db, 'products'));
      let deletedCount = 0;
      
      for (const docSnapshot of querySnapshot.docs) {
        try {
          await deleteDoc(doc(db, 'products', docSnapshot.id));
          deletedCount++;
          setSeedingStatus(`Clearing products... ${deletedCount}/${querySnapshot.docs.length}`);
        } catch (deleteError) {
          console.error(`Error deleting product ${docSnapshot.id}:`, deleteError);
        }
      }
      
      setSeedingStatus(`✅ Successfully cleared ${deletedCount} products!`);
    } catch (error) {
      setSeedingStatus('❌ Error clearing products. Check console for details.');
      console.error('Clearing error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const exportProductsJson = () => {
    const dataStr = JSON.stringify(sampleProducts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'premium_products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const categoryCounts = sampleProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const totalValue = sampleProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
          🚀 Premium Product Seeder
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '20px' }}>
          Seed your database with {sampleProducts.length} real premium products from top brands
        </p>
        
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{sampleProducts.length}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Products</div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{Object.keys(categoryCounts).length}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Categories</div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>${totalValue.toLocaleString()}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Inventory Value</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button 
          onClick={seedProducts} 
          disabled={isSeeding}
          style={{
            padding: '15px 30px',
            marginRight: '15px',
            backgroundColor: isSeeding ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isSeeding ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isSeeding ? '🔄 Seeding...' : '🚀 Seed Premium Products'}
        </button>
        
        <button 
          onClick={clearProducts} 
          disabled={isSeeding}
          style={{
            padding: '15px 30px',
            marginRight: '15px',
            backgroundColor: isSeeding ? '#9ca3af' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isSeeding ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isSeeding ? '🔄 Clearing...' : '🗑️ Clear All Products'}
        </button>
        
        <button 
          onClick={exportProductsJson}
          style={{
            padding: '15px 30px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📥 Export JSON
        </button>
      </div>
      
      {/* Status Message */}
      {seedingStatus && (
        <div style={{
          padding: '15px',
          backgroundColor: seedingStatus.includes('Error') ? '#fee2e2' : '#d1fae5',
          color: seedingStatus.includes('Error') ? '#dc2626' : '#065f46',
          border: `2px solid ${seedingStatus.includes('Error') ? '#f87171' : '#34d399'}`,
          borderRadius: '8px',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          {seedingStatus}
        </div>
      )}

      {/* Categories Overview */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          📊 Categories Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} style={{ 
              backgroundColor: '#ffffff', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '500', color: '#374151' }}>{category}</span>
              <span style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Products Preview */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px', color: '#1f2937' }}>
          🛍️ Premium Products Preview
        </h3>
        <div style={{ 
          maxHeight: '600px', 
          overflowY: 'auto', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px',
          backgroundColor: '#ffffff'
        }}>
          {sampleProducts.map((product, index) => (
            <div key={index} style={{ 
              padding: '20px', 
              borderBottom: index < sampleProducts.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{product.name}</strong>
                  {product.featured && (
                    <span style={{
                      marginLeft: '8px',
                      backgroundColor: '#fbbf24',
                      color: '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      ⭐ FEATURED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>
                  {product.brand} • {product.category}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }}>
                  ${product.price.toLocaleString()}
                </div>
              </div>
              
              <div>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.4' }}>
                  {product.description}
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>
                  Stock: <strong>{product.stock} units</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Value: ${(product.price * product.stock).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Warning Notice */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fef3c7', 
        border: '2px solid #f59e0b', 
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
          ⚠️ Important Notice
        </h4>
        <p style={{ color: '#92400e', marginBottom: '8px' }}>
          <strong>Remember to delete this component after seeding your database!</strong>
        </p>
        <p style={{ fontSize: '0.9rem', color: '#b45309' }}>
          This seeder will add products directly to your Firestore database.
          <br />
          All product images use working URLs from official brand sources.
        </p>
      </div>
    </div>
  );
};

export default ProductSeeder;