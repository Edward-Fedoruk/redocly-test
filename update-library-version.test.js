const { updatePackage } = require('./update-library-version');

describe('update-library-version', () => {
  it('should change version completely if package in dev dependencies or dependencies', () => {
    const npmPackage = 'testPackage'
    const updatedDevPackage = updatePackage({ 
        devDependencies: {
          [npmPackage]: '1.2.3'
        } 
    }, npmPackage, '2.2.2')

    const updatedPackage = updatePackage({ 
        dependencies: {
          [npmPackage]: '1.2.3'
        } 
    }, npmPackage, '2.2.2')
    

    expect(updatedDevPackage).toStrictEqual({ "devDependencies": {"testPackage": "2.2.2"} })
    expect(updatedPackage).toStrictEqual({ "dependencies": {"testPackage": "2.2.2"} })
  })

  xit('should handle dependency with ~', () => {
  })

  xit('should handle dependency with ^', () => {
  })
})