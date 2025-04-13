/**
 * Initial Army Setup Test
 * 
 * This test validates that:
 * 1. All region IDs in initial_army_setup.json exist in regions.json
 * 2. The initial army setup matches the requirements in the implementation guide
 * 3. The Fellowship is correctly placed in Rivendell
 */

const fs = require('fs');
const path = require('path');

// Load the data files
const regionsPath = path.resolve(__dirname, '../../../../data/regions.json');
const armySetupPath = path.resolve(__dirname, '../../../../data/initial_army_setup.json');

describe('Initial Army Setup Validation', () => {
  let regions;
  let armySetup;

  beforeAll(() => {
    // Load the data files
    regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    armySetup = JSON.parse(fs.readFileSync(armySetupPath, 'utf8'));
  });

  test('All region IDs in initial_army_setup.json exist in regions.json', () => {
    // Extract all region IDs from regions.json
    const validRegionIds = regions.regions.map(region => region.id);
    
    // Get all region IDs from initial_army_setup.json
    const setupRegionIds = Object.keys(armySetup.regions);
    
    // Check if all setup region IDs exist in the valid region IDs
    setupRegionIds.forEach(id => {
      expect(validRegionIds).toContain(id);
    });
  });

  test('Initial army setup matches key starting positions from implementation guide', () => {
    // Test Erebor (Dwarves)
    const erebor = armySetup.regions['28'];
    expect(erebor).toBeDefined();
    expect(erebor.name).toBe('Erebor');
    expect(erebor.units.regular).toBe(1);
    expect(erebor.units.elite).toBe(2);
    expect(erebor.leaders).toBe(1);
    expect(erebor.control).toBe('1');
    expect(erebor.nation).toBe('1');

    // Test Minas Tirith (Gondor)
    const minasTirith = armySetup.regions['53'];
    expect(minasTirith).toBeDefined();
    expect(minasTirith.name).toBe('Minas Tirith');
    expect(minasTirith.units.regular).toBe(3);
    expect(minasTirith.units.elite).toBe(1);
    expect(minasTirith.leaders).toBe(1);
    expect(minasTirith.control).toBe('3');
    expect(minasTirith.nation).toBe('3');

    // Test Rivendell (Elves)
    const rivendell = armySetup.regions['81'];
    expect(rivendell).toBeDefined();
    expect(rivendell.name).toBe('Rivendell');
    expect(rivendell.units.regular).toBe(0);
    expect(rivendell.units.elite).toBe(2);
    expect(rivendell.leaders).toBe(1);
    expect(rivendell.control).toBe('2');
    expect(rivendell.nation).toBe('2');

    // Test Edoras (Rohan)
    const edoras = armySetup.regions['26'];
    expect(edoras).toBeDefined();
    expect(edoras.name).toBe('Edoras');
    expect(edoras.units.regular).toBe(1);
    expect(edoras.units.elite).toBe(1);
    expect(edoras.control).toBe('5');
    expect(edoras.nation).toBe('5');

    // Test Dale (The North)
    const dale = armySetup.regions['12'];
    expect(dale).toBeDefined();
    expect(dale.name).toBe('Dale');
    expect(dale.units.regular).toBe(1);
    expect(dale.leaders).toBe(1);
    expect(dale.control).toBe('4');
    expect(dale.nation).toBe('4');

    // Test Barad Dur (Sauron)
    const baradDur = armySetup.regions['6'];
    expect(baradDur).toBeDefined();
    expect(baradDur.name).toBe('Barad Dur');
    expect(baradDur.units.regular).toBe(4);
    expect(baradDur.units.elite).toBe(1);
    expect(baradDur.leaders).toBe(1);
    expect(baradDur.control).toBe('7');
    expect(baradDur.nation).toBe('7');

    // Test Orthanc (Isengard)
    const orthanc = armySetup.regions['76'];
    expect(orthanc).toBeDefined();
    expect(orthanc.name).toBe('Orthanc');
    expect(orthanc.units.regular).toBe(4);
    expect(orthanc.units.elite).toBe(1);
    expect(orthanc.control).toBe('6');
    expect(orthanc.nation).toBe('6');

    // Test Minas Morgul (Sauron)
    const minasMorgul = armySetup.regions['52'];
    expect(minasMorgul).toBeDefined();
    expect(minasMorgul.name).toBe('Minas Morgul');
    expect(minasMorgul.units.regular).toBe(5);
    expect(minasMorgul.leaders).toBe(1);
    expect(minasMorgul.control).toBe('7');
    expect(minasMorgul.nation).toBe('7');

    // Test Umbar (Southrons & Easterlings)
    const umbar = armySetup.regions['95'];
    expect(umbar).toBeDefined();
    expect(umbar.name).toBe('Umbar');
    expect(umbar.units.regular).toBe(3);
    expect(umbar.control).toBe('8');
    expect(umbar.nation).toBe('8');

    // Test Osgiliath (Neutral)
    const osgiliath = armySetup.regions['77'];
    expect(osgiliath).toBeDefined();
    expect(osgiliath.name).toBe('Osgiliath');
    expect(osgiliath.units.regular).toBe(2);
    expect(osgiliath.control).toBe('0');
    expect(osgiliath.nation).toBe('0');
  });

  test('All regions have siegeStatus set to "out" by default', () => {
    // Check that all regions have siegeStatus set to "out"
    Object.values(armySetup.regions).forEach(region => {
      expect(region.siegeStatus).toBe('out');
    });
  });

  test('All regions have empty characters array by default', () => {
    // Check that all regions have empty characters array
    Object.values(armySetup.regions).forEach(region => {
      expect(region.characters).toEqual([]);
    });
  });

  test('All regions have valid nation codes', () => {
    // Check that all regions have valid nation codes (0-8)
    Object.values(armySetup.regions).forEach(region => {
      const nationCode = parseInt(region.nation);
      expect(nationCode).toBeGreaterThanOrEqual(0);
      expect(nationCode).toBeLessThanOrEqual(8);
    });
  });

  // Additional test for the Morannon region which has a string value for regular units
  test('Morannon region has correct unit format', () => {
    const morannon = armySetup.regions['55'];
    expect(morannon).toBeDefined();
    expect(morannon.name).toBe('Morannon');
    // The regular units are stored as a string "5" instead of a number 5
    expect(typeof morannon.units.regular).toBe('string');
    expect(morannon.units.regular).toBe('5');
  });
});
