export const generateQRData = (item, type) => {
  const baseUrl = window.location.origin;
  const timestamp = new Date().toISOString();

  const baseData = {
    timestamp,
    source: "wholesaler-app",
    version: "1.0",
  };

  switch (type) {
    case "product":
      return {
        ...baseData,
        type: "product",
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        stock: item.stock,
        category: item.category,
        url: `${baseUrl}/products/${item.id}`,
      };

    case "order":
      return {
        ...baseData,
        type: "order",
        id: item.id,
        customer: item.customerName,
        total: item.total,
        status: item.status,
        itemCount: item.itemCount || 0,
        url: `${baseUrl}/orders/${item.id}`,
      };

    case "user":
      return {
        ...baseData,
        type: "user",
        id: item.id,
        email: item.email,
        name: item.displayName,
        role: item.role || item.accountType,
        url: `${baseUrl}/admin/users/${item.id}`,
      };

    case "inventory":
      return {
        ...baseData,
        type: "inventory",
        productId: item.id,
        name: item.name,
        stock: item.stock,
        location: item.location || "warehouse",
        lastUpdated: item.updatedAt,
        url: `${baseUrl}/inventory/${item.id}`,
      };

    default:
      return {
        ...baseData,
        type: "generic",
        data: item,
      };
  }
};

export const parseQRData = (qrString) => {
  try {
    const data = JSON.parse(qrString);

    // Validate our QR code format
    if (data.source === "wholesaler-app" && data.type && data.id) {
      return {
        isValid: true,
        isOurFormat: true,
        data,
        type: data.type,
        id: data.id,
        url: data.url,
      };
    }

    // It's JSON but not our format
    return {
      isValid: true,
      isOurFormat: false,
      data,
      type: "unknown",
      rawData: qrString,
    };
  } catch (err) {
    // Not JSON, treat as plain text
    return {
      isValid: true,
      isOurFormat: false,
      data: qrString,
      type: "text",
      rawData: qrString,
    };
  }
};

export const handleQRNavigation = (qrResult, navigate) => {
  const parsed = parseQRData(qrResult);

  if (parsed.isOurFormat && parsed.url) {
    const shouldNavigate = window.confirm(
      `QR code detected for ${parsed.type}: ${parsed.data.name || parsed.data.customer || parsed.data.email || parsed.id}. 
      
Navigate to this item?`,
    );

    if (shouldNavigate) {
      // Extract path from URL
      const url = new URL(parsed.url);
      navigate(url.pathname);
      return true;
    }
  } else if (parsed.type === "text" && parsed.data.startsWith("http")) {
    // Handle external URLs
    const shouldOpen = window.confirm(
      `External URL detected: ${parsed.data}
      
Open this link?`,
    );

    if (shouldOpen) {
      window.open(parsed.data, "_blank");
      return true;
    }
  }

  return false;
};

export const downloadQRCode = async (qrCodeDataUrl, filename) => {
  try {
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename || `qr-code-${Date.now()}.png`;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Download failed:", error);
    return false;
  }
};
