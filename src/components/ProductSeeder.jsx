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
      description: "Latest iPhone with A18 Pro chip, 6.9-inch Super Retina XDR display, advanced camera system with 5x telephoto zoom, titanium design, and all-day battery life. Available in Natural Titanium, Blue Titanium, White Titanium, and Black Titanium.",
      image: "https://i.imgur.com/KQx8fJm.jpg",
      stock: 25,
      featured: true,
      brand: "Apple",
      model: "iPhone 16 Pro Max",
      specifications: {
        display: "6.9-inch Super Retina XDR",
        processor: "A18 Pro chip",
        storage: "256GB",
        camera: "48MP main, 12MP ultra-wide, 12MP telephoto",
        battery: "Up to 29 hours video playback"
      }
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      category: "Smartphones",
      price: 1299.99,
      description: "Premium Android flagship with S Pen, 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, 200MP camera with 100x Space Zoom, and integrated AI features for enhanced productivity.",
      image: "https://i.imgur.com/8VzNq3k.jpg",
      stock: 20,
      featured: true,
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      specifications: {
        display: "6.8-inch Dynamic AMOLED 2X",
        processor: "Snapdragon 8 Gen 3",
        storage: "512GB",
        camera: "200MP main, 12MP ultra-wide, 10MP telephoto",
        battery: "5000mAh with 45W fast charging"
      }
    },
    {
      name: "Google Pixel 8 Pro",
      category: "Smartphones",
      price: 999.99,
      description: "Google's flagship with advanced AI photography, Tensor G3 chip, 6.7-inch LTPO OLED display, Magic Eraser, Best Take, and 7 years of OS updates. Pure Android experience with exclusive Google features.",
      image: "https://i.imgur.com/LpR9Kn2.jpg",
      stock: 18,
      featured: true,
      brand: "Google",
      model: "Pixel 8 Pro",
      specifications: {
        display: "6.7-inch LTPO OLED",
        processor: "Google Tensor G3",
        storage: "256GB",
        camera: "50MP main, 48MP ultra-wide, 48MP telephoto",
        battery: "5050mAh with 30W fast charging"
      }
    },

    // Laptops
    {
      name: "MacBook Pro 16-inch M4 Pro",
      category: "Laptops",
      price: 2499.99,
      description: "Professional laptop powered by Apple M4 Pro chip with 12-core CPU and 18-core GPU. Features 16.2-inch Liquid Retina XDR display, up to 22 hours battery life, advanced thermal design, and studio-quality mics.",
      image: "https://i.imgur.com/9JkLm8P.jpg",
      stock: 12,
      featured: true,
      brand: "Apple",
      model: "MacBook Pro 16-inch M4 Pro",
      specifications: {
        processor: "Apple M4 Pro 12-core CPU",
        graphics: "18-core GPU",
        memory: "18GB unified memory",
        storage: "512GB SSD",
        display: "16.2-inch Liquid Retina XDR",
        battery: "Up to 22 hours"
      }
    },
    {
      name: "Dell XPS 15 (9530)",
      category: "Laptops",
      price: 1899.99,
      description: "Premium Windows laptop with 13th Gen Intel Core i7, NVIDIA GeForce RTX 4070, 15.6-inch 3.5K OLED InfinityEdge display, and precision-crafted aluminum chassis. Perfect for creators and professionals.",
      image: "https://i.imgur.com/Qk4Nm7R.jpg",
      stock: 15,
      featured: true,
      brand: "Dell",
      model: "XPS 15 (9530)",
      specifications: {
        processor: "Intel Core i7-13700H",
        graphics: "NVIDIA GeForce RTX 4070",
        memory: "32GB LPDDR5",
        storage: "1TB PCIe NVMe SSD",
        display: "15.6-inch 3.5K OLED",
        battery: "Up to 13 hours"
      }
    },
    {
      name: "ASUS ROG Strix G16 (2024)",
      category: "Gaming Laptops",
      price: 1599.99,
      description: "High-performance gaming laptop with Intel Core i7-13650HX, NVIDIA GeForce RTX 4060, 16-inch FHD 165Hz display, RGB keyboard, and advanced cooling system. Built for serious gaming and content creation.",
      image: "https://i.imgur.com/3PqR8Nj.jpg",
      stock: 10,
      featured: true,
      brand: "ASUS",
      model: "ROG Strix G16 (2024)",
      specifications: {
        processor: "Intel Core i7-13650HX",
        graphics: "NVIDIA GeForce RTX 4060",
        memory: "16GB DDR5",
        storage: "1TB PCIe 4.0 NVMe SSD",
        display: "16-inch FHD 165Hz",
        cooling: "ROG Intelligent Cooling"
      }
    },

    // Audio Devices
    {
      name: "Sony WH-1000XM5",
      category: "Audio",
      price: 399.99,
      description: "Industry-leading noise canceling wireless headphones with 30-hour battery life, crystal-clear hands-free calling, and premium sound quality. Features adaptive sound control and multipoint connection.",
      image: "https://i.imgur.com/7YwGXht.jpg",
      stock: 35,
      featured: true,
      brand: "Sony",
      model: "WH-1000XM5",
      specifications: {
        type: "Over-ear wireless headphones",
        noiseCanceling: "Industry-leading Active Noise Canceling",
        battery: "Up to 30 hours",
        charging: "Quick charge: 3 min = 3 hours",
        connectivity: "Bluetooth 5.2, multipoint"
      }
    },
    {
      name: "Apple AirPods Pro (3rd generation)",
      category: "Audio",
      price: 249.99,
      description: "Premium wireless earbuds with adaptive transparency, personalized spatial audio, H2 chip for enhanced performance, and up to 6 hours listening time with ANC. Includes MagSafe charging case.",
      image: "https://i.imgur.com/Bk9PqLm.jpg",
      stock: 40,
      featured: true,
      brand: "Apple",
      model: "AirPods Pro (3rd generation)",
      specifications: {
        chip: "Apple H2",
        noiseCanceling: "Active Noise Cancellation",
        battery: "6 hours (earbuds), 30 hours (with case)",
        features: "Adaptive Transparency, Spatial Audio",
        charging: "MagSafe and Lightning"
      }
    },

    // Smart Watches
    {
      name: "Apple Watch Series 10",
      category: "Wearables",
      price: 429.99,
      description: "Latest Apple Watch with larger 46mm display, advanced health monitoring including blood oxygen and ECG, GPS + Cellular connectivity, swim-proof design, and all-day battery life.",
      image: "https://i.imgur.com/Kj7Pm9N.jpg",
      stock: 30,
      featured: true,
      brand: "Apple",
      model: "Apple Watch Series 10",
      specifications: {
        display: "46mm Always-On Retina",
        health: "Blood Oxygen, ECG, Heart Rate",
        connectivity: "GPS + Cellular",
        battery: "Up to 18 hours",
        resistance: "50-meter water resistant"
      }
    },
    {
      name: "Samsung Galaxy Watch 7",
      category: "Wearables",
      price: 329.99,
      description: "Advanced smartwatch with Wear OS, comprehensive health tracking, 40mm Super AMOLED display, GPS, 5ATM water resistance, and seamless integration with Galaxy ecosystem.",
      image: "https://i.imgur.com/Rq8Zk4L.jpg",
      stock: 25,
      featured: true,
      brand: "Samsung",
      model: "Galaxy Watch 7",
      specifications: {
        display: "40mm Super AMOLED",
        os: "Wear OS powered by Samsung",
        health: "Advanced sleep, body composition",
        battery: "Up to 30 hours",
        connectivity: "Bluetooth, Wi-Fi, optional LTE"
      }
    },

    // Gaming Consoles
    {
      name: "PlayStation 5 Pro",
      category: "Gaming",
      price: 699.99,
      description: "Most advanced PlayStation console with enhanced GPU, AI-driven upscaling, 2TB SSD storage, and support for 8K gaming. Backwards compatible with PS4 games and features ray tracing technology.",
      image: "https://i.imgur.com/3MnKp7Q.jpg",
      stock: 8,
      featured: true,
      brand: "Sony",
      model: "PlayStation 5 Pro",
      specifications: {
        processor: "Custom AMD Zen 2",
        graphics: "Custom RDNA 2 GPU with ray tracing",
        storage: "2TB Custom NVMe SSD",
        resolution: "Up to 8K output",
        features: "3D Audio, DualSense controller"
      }
    },
    {
      name: "Xbox Series X",
      category: "Gaming",
      price: 499.99,
      description: "Microsoft's most powerful console with 12 teraflops of processing power, 1TB NVMe SSD, 4K gaming at 60fps, Quick Resume feature, and backward compatibility with thousands of games.",
      image: "https://i.imgur.com/8TjRnKs.jpg",
      stock: 12,
      featured: true,
      brand: "Microsoft",
      model: "Xbox Series X",
      specifications: {
        processor: "Custom AMD Zen 2 8-core",
        graphics: "Custom AMD RDNA 2 GPU",
        storage: "1TB NVMe SSD",
        resolution: "4K at 60fps, up to 120fps",
        features: "Quick Resume, Smart Delivery"
      }
    },

    // Tablets
    {
      name: "iPad Pro 13-inch M4",
      category: "Tablets",
      price: 1299.99,
      description: "Ultimate iPad with M4 chip, stunning 13-inch Ultra Retina XDR display with ProMotion, Apple Pencil Pro support, Magic Keyboard compatibility, and professional-grade performance.",
      image: "https://i.imgur.com/Vx7KmPq.jpg",
      stock: 15,
      featured: true,
      brand: "Apple",
      model: "iPad Pro 13-inch M4",
      specifications: {
        processor: "Apple M4 chip",
        display: "13-inch Ultra Retina XDR",
        storage: "512GB",
        connectivity: "Wi-Fi 6E, optional 5G",
        compatibility: "Apple Pencil Pro, Magic Keyboard"
      }
    },
    {
      name: "Samsung Galaxy Tab S9 Ultra",
      category: "Tablets",
      price: 1199.99,
      description: "Premium Android tablet with massive 14.6-inch Super AMOLED display, Snapdragon 8 Gen 2 processor, S Pen included, DeX mode for desktop experience, and IP68 water resistance.",
      image: "https://i.imgur.com/9QrTkNj.jpg",
      stock: 12,
      featured: true,
      brand: "Samsung",
      model: "Galaxy Tab S9 Ultra",
      specifications: {
        display: "14.6-inch Super AMOLED",
        processor: "Snapdragon 8 Gen 2",
        storage: "512GB",
        sPen: "Included S Pen with low latency",
        resistance: "IP68 water resistant"
      }
    },

    // Smart Home
    {
      name: "Amazon Echo Show 15",
      category: "Smart Home",
      price: 249.99,
      description: "Smart display with 15.6-inch Full HD screen, Alexa voice control, family calendar, notes, and photos. Perfect kitchen companion with recipe display and video calling capabilities.",
      image: "https://i.imgur.com/LkMn8Pj.jpg",
      stock: 20,
      featured: false,
      brand: "Amazon",
      model: "Echo Show 15",
      specifications: {
        display: "15.6-inch Full HD",
        assistant: "Alexa built-in",
        camera: "5MP front-facing",
        features: "Visual ID, family profiles",
        connectivity: "Wi-Fi, Zigbee hub"
      }
    },
    {
      name: "Nest Learning Thermostat (4th Gen)",
      category: "Smart Home",
      price: 279.99,
      description: "Intelligent thermostat that learns your schedule and preferences, with energy-saving features, remote control via app, and compatibility with most HVAC systems. ENERGY STAR certified.",
      image: "https://i.imgur.com/PkR7Lmj.jpg",
      stock: 25,
      featured: false,
      brand: "Google Nest",
      model: "Learning Thermostat (4th Gen)",
      specifications: {
        display: "High-resolution color",
        compatibility: "Most 24V HVAC systems",
        connectivity: "Wi-Fi, Bluetooth",
        sensors: "Temperature, humidity, motion",
        efficiency: "ENERGY STAR certified"
      }
    },

    // Cameras
    {
      name: "Canon EOS R5 Mark II",
      category: "Cameras",
      price: 4299.99,
      description: "Professional mirrorless camera with 45MP full-frame sensor, 8K video recording, advanced dual-pixel autofocus, in-body image stabilization, and weather-sealed magnesium alloy body.",
      image: "https://i.imgur.com/7NkQpLm.jpg",
      stock: 6,
      featured: true,
      brand: "Canon",
      model: "EOS R5 Mark II",
      specifications: {
        sensor: "45MP full-frame CMOS",
        video: "8K RAW, 4K 120p",
        autofocus: "Dual Pixel CMOS AF II",
        stabilization: "In-body 8-stop IS",
        mount: "Canon RF mount"
      }
    },
    {
      name: "Sony A7R V",
      category: "Cameras",
      price: 3899.99,
      description: "High-resolution mirrorless camera with 61MP sensor, AI-powered autofocus, 8K video capability, 5-axis image stabilization, and professional-grade build quality for demanding photographers.",
      image: "https://i.imgur.com/8FkNm2P.jpg",
      stock: 8,
      featured: true,
      brand: "Sony",
      model: "Alpha 7R V",
      specifications: {
        sensor: "61MP full-frame Exmor R",
        video: "8K 24p, 4K 60p",
        autofocus: "759-point phase detection",
        stabilization: "5-axis optical stabilization",
        battery: "Up to 530 shots"
      }
    },

    // Kitchen Appliances
    {
      name: "KitchenAid Artisan Stand Mixer",
      category: "Kitchen Appliances",
      price: 449.99,
      description: "Iconic 5-quart stand mixer with 325-watt motor, 10-speed slide control, tilt-head design, and included attachments. Available in multiple colors with compatibility for 15+ attachments.",
      image: "https://i.imgur.com/Qm9NkLp.jpg",
      stock: 18,
      featured: false,
      brand: "KitchenAid",
      model: "Artisan Series 5-Qt",
      specifications: {
        capacity: "5-quart stainless steel bowl",
        power: "325-watt motor",
        speeds: "10-speed slide control",
        design: "Tilt-head design",
        attachments: "Wire whisk, dough hook, flat beater"
      }
    },
    {
      name: "Breville Barista Express Espresso Machine",
      category: "Kitchen Appliances",
      price: 699.99,
      description: "All-in-one espresso machine with built-in conical burr grinder, precise espresso extraction, steam wand for microfoam milk texturing, and pre-infusion function for optimal flavor.",
      image: "https://i.imgur.com/5RkTn8J.jpg",
      stock: 12,
      featured: true,
      brand: "Breville",
      model: "Barista Express BES870XL",
      specifications: {
        grinder: "Conical burr grinder",
        pressure: "15-bar Italian pump",
        water: "67oz removable water tank",
        features: "Pre-infusion, PID temperature control",
        warranty: "2-year limited warranty"
      }
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
            id: crypto.randomUUID(), // Generate unique ID
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
      console.error('Make sure you have:');
      console.error('1. Firebase config in src/firebase/config.js');
      console.error('2. Firestore initialized and rules set up');
      console.error('3. "products" collection permissions configured');
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
      console.error('Make sure you have proper Firestore permissions to delete documents');
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
                <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.4', marginBottom: '8px' }}>
                  {product.description.slice(0, 120)}...
                </p>
                {product.specifications && (
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    <strong>Key specs:</strong> {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(' • ')}
                  </div>
                )}
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
          Update the API endpoints (/api/products/seed and /api/products/clear) to match your backend.
          <br />
          All product images use placeholder Imgur URLs - replace with actual product images.
        </p>
      </div>
    </div>
  );
};

export default ProductSeeder;