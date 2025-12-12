import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

function Products({ products = [], t, onStockUpdate, onProductAdd }) {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [parsedProducts, setParsedProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const fileInputRef = useRef(null)
  const addProductFileInputRef = useRef(null)

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadStatus({ type: 'error', message: t.excelError || 'Invalid file format. Please upload Excel file.' })
      return
    }

    setUploading(true)
    setUploadStatus({ type: 'info', message: t.processingExcel || 'Processing...' })

    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          const stockUpdates = jsonData.map(row => {
            const name = row['Product Name'] || row['product_name'] || row['Name'] || row['name'] || row['Product'] || row['product']
            const stock = row['Stock'] || row['stock'] || row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || row['In Stock'] || row['in_stock']
            
            return {
              name: String(name || '').trim(),
              stock: parseInt(stock) || 0
            }
          }).filter(item => item.name && !isNaN(item.stock))

          if (stockUpdates.length === 0) {
            setUploadStatus({ 
              type: 'error', 
              message: 'No valid stock data found. Please check your Excel file format.' 
            })
            setUploading(false)
            return
          }

          if (onStockUpdate) {
            onStockUpdate(stockUpdates)
          }

          setUploadStatus({ 
            type: 'success', 
            message: `${t.stockUpdated || 'Stock updated'}: ${stockUpdates.length} products` 
          })
          
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        } catch (parseError) {
          console.error('Error parsing Excel:', parseError)
          setUploadStatus({ 
            type: 'error', 
            message: t.excelError || 'Error parsing Excel file. Please check the format.' 
          })
        } finally {
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setUploadStatus({ type: 'error', message: t.excelError || 'Error reading file' })
        setUploading(false)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ type: 'error', message: t.excelError || 'Error uploading file' })
      setUploading(false)
    }
  }

  const handleAddProductExcel = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadStatus({ type: 'error', message: t.excelError || 'Invalid file format.' })
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          // Parse products with all attributes
          const products = jsonData.map((row, index) => {
            // Try multiple column name variations
            const name = row['Product Name'] || row['product_name'] || row['Name'] || row['name'] || row['Product'] || row['product'] || row['نام محصول']
            const price = row['Price'] || row['price'] || row['قیمت'] || row['Cost'] || row['cost']
            const color = row['Color'] || row['color'] || row['Colour'] || row['colour'] || row['رنگ']
            const stock = row['Stock'] || row['stock'] || row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || row['In Stock'] || row['in_stock'] || row['موجودی']
            const category = row['Category'] || row['category'] || row['دسته‌بندی'] || row['Type'] || row['type']
            const description = row['Description'] || row['description'] || row['Desc'] || row['desc'] || row['توضیحات'] || row['Details'] || row['details']
            
            return {
              id: `new-prod-${Date.now()}-${index}`,
              name: String(name || '').trim(),
              price: price ? (typeof price === 'string' ? price : `$${price}`) : '$0',
              color: String(color || '').trim(),
              stock: parseInt(stock) || 0,
              category: String(category || 'Other').trim(),
              description: String(description || '').trim(),
            }
          }).filter(item => item.name) // Only include products with a name

          if (products.length === 0) {
            setUploadStatus({ 
              type: 'error', 
              message: t.noProductsFound || 'No products found in Excel file.' 
            })
            setUploading(false)
            return
          }

          setParsedProducts(products)
          setSelectedProducts(new Set(products.map(p => p.id)))
          setUploading(false)
        } catch (parseError) {
          console.error('Error parsing Excel:', parseError)
          setUploadStatus({ 
            type: 'error', 
            message: t.excelError || 'Error parsing Excel file.' 
          })
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setUploadStatus({ type: 'error', message: t.excelError || 'Error reading file' })
        setUploading(false)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ type: 'error', message: t.excelError || 'Error uploading file' })
      setUploading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleAddProductClick = () => {
    setModalOpen(true)
    setParsedProducts([])
    setSelectedProducts(new Set())
  }

  const handleAddProductFileClick = () => {
    addProductFileInputRef.current?.click()
  }

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleAddSelectedProducts = () => {
    const productsToAdd = parsedProducts.filter(p => selectedProducts.has(p.id))
    
    if (productsToAdd.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please select at least one product' })
      return
    }

    if (onProductAdd) {
      onProductAdd(productsToAdd)
    }

    setUploadStatus({ 
      type: 'success', 
      message: `${t.productsAdded || 'Products added'}: ${productsToAdd.length} products` 
    })
    
    setModalOpen(false)
    setParsedProducts([])
    setSelectedProducts(new Set())
    
    if (addProductFileInputRef.current) {
      addProductFileInputRef.current.value = ''
    }
  }

  const handleAddSingleProduct = (product) => {
    if (onProductAdd) {
      onProductAdd([product])
    }

    setUploadStatus({ 
      type: 'success', 
      message: t.addProductSuccess || 'Product added successfully' 
    })
    
    // Remove from parsed products
    setParsedProducts(prev => prev.filter(p => p.id !== product.id))
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      newSet.delete(product.id)
      return newSet
    })
  }

    return (
    <>
      <section className="products-section">
        <div className="products-section__header">
        <div>
            <p className="dashboard__eyebrow">{t.products}</p>
            <h2>{t.manageProducts}</h2>
            <p>{t.productsDescription}</p>
          </div>
          <div className="products-section__actions">
            <button 
              type="button" 
              className="connect-button products-section__cta"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (t.processingExcel || 'Processing...') : (t.uploadExcel || 'Upload Excel')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              className="connect-button products-section__cta"
              onClick={handleAddProductClick}
            >
              {t.addProduct}
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className={`upload-status upload-status--${uploadStatus.type}`}>
            {uploadStatus.message}
          </div>
        )}

        <div className="product-grid">
          {products.map((item) => (
            <article key={item.id} className="product-card">
              <div className="product-card__badge">{item.category}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              {item.color && <p className="product-card__color">رنگ: {item.color}</p>}
              <div className="product-card__meta">
                <strong>{item.price}</strong>
                <span>{t.stockLabel.replace('{count}', item.stock)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.addProductModal}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="excel-upload-section">
                <h3>{t.addProductFromExcel}</h3>
                <p className="excel-format-hint">{t.excelFileFormat}</p>
                <button 
                  type="button"
                  className="connect-button"
                  onClick={handleAddProductFileClick}
                  disabled={uploading}
                >
                  {uploading ? (t.processingExcel || 'Processing...') : (t.uploadExcelFile || 'Upload Excel File')}
                </button>
                <input
                  ref={addProductFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleAddProductExcel}
                  style={{ display: 'none' }}
                />
              </div>

              {parsedProducts.length > 0 && (
                <div className="products-preview">
                  <div className="products-preview__header">
                    <h3>{t.productsPreview} ({parsedProducts.length})</h3>
                    <button 
                      className="connect-button"
                      onClick={handleAddSelectedProducts}
                      disabled={selectedProducts.size === 0}
                    >
                      {t.addSelected} ({selectedProducts.size})
                    </button>
                  </div>
                  
                  <div className="products-table">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedProducts.size === parsedProducts.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts(new Set(parsedProducts.map(p => p.id)))
                                } else {
                                  setSelectedProducts(new Set())
                                }
                              }}
                            />
                          </th>
                          <th>{t.productName}</th>
                          <th>{t.price}</th>
                          <th>{t.color}</th>
                          <th>{t.stock}</th>
                          <th>{t.category}</th>
                          <th>{t.description}</th>
                          <th>{t.addProduct}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedProducts.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => handleToggleProduct(product.id)}
                              />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>{product.color || '-'}</td>
                            <td>{product.stock}</td>
                            <td>{product.category}</td>
                            <td>{product.description || '-'}</td>
                            <td>
                              <button
                                className="add-single-button"
                                onClick={() => handleAddSingleProduct(product)}
                              >
                                {t.addProduct}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setModalOpen(false)}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    )
}

export default Products
