#include "./DynamicEntities.h"
#include "./Simulation.h"

//////////////////////////////////////////////////////////
// Example_Sim
// Descr: Demonstration of how to instantiate and run an 
// example simulation
//////////////////////////////////////////////////////////

int main(void) 
{
    // Initialize and Run Pen Simulation
    {        
            const CrudeSpinningPen::State penStateInput{
                // x, y, z
                2.0,
                3.0,
                4.0,
                // theta, phi, psi
                0.5,
                0.6,
                0.7,
                // vx, vy, vz
                5.0,
                5.0,
                10.0,
                // theta_dot, phi_dot, psi_dot
                10.0,
                10.0,
                10.0
            };

            // Cylinder in body coordinates.
            const std::array<double, 3> inertia = {10.0, 10.0, 1.0};
            CrudeSpinningPen csp(penStateInput, inertia);

            Simulation simCsp(2.04, .01, true, csp);
            const bool isValidCsp = simCsp.Run();        
        }

    return 0;
}
