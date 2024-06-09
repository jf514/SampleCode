#include "./Simulation.h"
#include "./DynamicEntities.h"
#include "./TestUtils.h"

#include <iostream>

//////////////////////////////////////////////////////////
// Simulation Unit Tests
//////////////////////////////////////////////////////////

int main(void)
{
    //////////////////////////////////////////////////////////
    // Test of ConstantVelParticle based sim.
    {
        ConstantVelParticle cvp{ConstantVelParticle::State{1.0, 1.0}};

        Simulation simCvp(1, 0.1, false, cvp );
        const bool isValidCvp = simCvp.Run();
        TestUtils::ReportResults(isValidCvp, "CVP Test: isValid");
    }
    
    //////////////////////////////////////////////////////////
    // Test of SimpleSpringMotion
    {
        SimpleSpringMotion shm{SimpleSpringMotion::State{1.0, 0.0}, 10.0};

        Simulation simShm(2.1, 0.01, false, shm);
        const bool isValidShm = simShm.Run();
        TestUtils::ReportResults(isValidShm, "SHM Test: isValid");
    }

    //////////////////////////////////////////////////////////
    // No spin:
    // Pen lauched in with horiz and vertical vels
    // only. Horiz. vels should be unchanged, vertical vel.
    // should be reversed when it returns to initial height
    {        
        const CrudeSpinningPen::State penStateInput{
            // x, y, z
            0.0,
            0.0,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            0.0,
            // vx, vy, vz
            10.0,
            10.0,
            10.0,
            // theta_dot, phi_dot, psi_dot
            0.0,
            0.0,
            0.0
        };

        // Cylinder in body coordinates.
        std::array<double, 3> inertia = {10.0, 10.0, 1.0};
        CrudeSpinningPen csp(penStateInput, inertia);

        Simulation simCsp(2.04, .01, false, csp);
        const bool isValidCsp = simCsp.Run();
        TestUtils::ReportResults(isValidCsp, "CPM Test: isValid");
        
        const CrudeSpinningPen::State outputActual = simCsp.GetOutput();

        // Expected output. Expect x, y coords to change at constant
        // velocity, expect z to be zero, and z-velocity to be opposite
        // as pen falls back to launch point 
        const CrudeSpinningPen::State outputExpected{
            // x, y, z
            20.4,
            20.4,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            0.0,
            // vx, vy, vz
            10.0,
            10.0,
            -10.0,
            // theta_dot, phi_dot, psi_dot
            0.0,
            0.0,
            0.0
        };

        const bool statesEq = TestUtils::FloatEquals(outputActual, outputExpected, 0.01);
        TestUtils::ReportResults(statesEq, "CPM Test: No Spin States Equal");
    }

    //////////////////////////////////////////////////////////
    // Z-spin:
    // Pen launched in x, y, z dirs AND spinnig about axis of 
    // symmetry. Expect spatial evolution as above and rotation
    // only along original spin axis.
    {        
        const CrudeSpinningPen::State penStateInput{
            // x, y, z
            0.0,
            0.0,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            0.0,
            // vx, vy, vz
            10.0,
            10.0,
            10.0,
            // theta_dot, phi_dot, psi_dot
            0.0,
            0.0,
            10.0
        };

        // Cylinder in body coordinates.
        const std::array<double, 3> inertia = {10.0, 10.0, 1.0};
        CrudeSpinningPen csp(penStateInput, inertia);

        Simulation simCsp(2.04, .01, false, csp);
        const bool isValidCsp = simCsp.Run();
        TestUtils::ReportResults(isValidCsp, "CPM Test: isValid");
        
        const CrudeSpinningPen::State outputActual = simCsp.GetOutput();

        // Expected output. Expect x, y coords to change at constant
        // velocity, expect z to be zero, and z-velocity to be opposite
        // as pen falls back to launch point, and expect angular
        // velocities to remain same as initial.
        const CrudeSpinningPen::State outputExpected{
            // x, y, z
            20.4,
            20.4,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            20.4,
            // vx, vy, vz
            10.0,
            10.0,
            -10.0,
            // theta_dot, phi_dot, psi_dot
            0.0,
            0.0,
            10.0
        };

        bool statesEq = TestUtils::FloatEquals(outputActual, outputExpected, 0.01);
        TestUtils::ReportResults(statesEq, "CPM Test: Z Spin States Equal");
    }

    //////////////////////////////////////////////////////////
    // Flat spin:
    // Pen launched with x, y, z motions, but also spinining
    // only on an axis perpendicular to axis of symmetry.
    // We expect the same spatial motion as above, and spin
    // to remain along same axis.
    {        
        const CrudeSpinningPen::State penStateInput{
            // x, y, z
            0.0,
            0.0,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            0.0,
            // vx, vy, vz
            10.0,
            10.0,
            10.0,
            // theta_dot, phi_dot, psi_dot
            10.0,
            0.0,
            0.0
        };

        // Cylinder in body coordinates.
        const std::array<double, 3> inertia = {10.0, 10.0, 1.0};
        CrudeSpinningPen csp(penStateInput, inertia);

        Simulation simCsp(2.04, .01, false, csp);
        const bool isValidCsp = simCsp.Run();
        TestUtils::ReportResults(isValidCsp, "CPM Test: isValid");
        
        const CrudeSpinningPen::State outputActual = simCsp.GetOutput();

        // Expected output. Expect x, y coords to change at constant
        // velocity, expect z to be zero, and z-velocity to be opposite
        // as pen falls back to launch point, AND expect spin only along
        // same axis.
        const CrudeSpinningPen::State outputExpected{
            // x, y, z
            20.4,
            20.4,
            0.0,
            // theta, phi, psi
            20.4,
            0.0,
            0.0,
            // vx, vy, vz
            10.0,
            10.0,
            -10.0,
            // theta_dot, phi_dot, psi_dot
            10.0,
            0.0,
            0.0
        };

        const bool statesEq = TestUtils::FloatEquals(outputActual, outputExpected, 0.01);
        TestUtils::ReportResults(statesEq, "CPM Test: Flat States Equal");
    }

    //////////////////////////////////////////////////////////
    // Torque free precession:
    // Pen launched with spatial motion as above, but with spin
    // along two axes, perpendicular and along axis of symmetry. 
    // Expect angular motion to transfer between axes to conserve
    // angular momentum.
    {        
        const CrudeSpinningPen::State penStateInput{
            // x, y, z
            0.0,
            0.0,
            0.0,
            // theta, phi, psi
            0.0,
            0.0,
            0.0,
            // vx, vy, vz
            0.0,
            0.0,
            10.0,
            // theta_dot, phi_dot, psi_dot
            10.0,
            0.0,
            10.0
        };

        // Cylinder in body coordinates.
        const std::array<double, 3> inertia = {10.0, 10.0, 1.0};
        CrudeSpinningPen csp(penStateInput, inertia);

        Simulation simCsp(2.04, .01, false, csp);
        const bool isValidCsp = simCsp.Run();
        TestUtils::ReportResults(isValidCsp, "CPM Test: isValid");
        
        const CrudeSpinningPen::State outputActual = simCsp.GetOutput();

        // Check that phi_dot is now non-zero
        const bool phi_dotNotZero = outputActual[10] != 0.0;
        TestUtils::ReportResults(phi_dotNotZero, "CPM Test: phi_dotNotZero");
    }
}
