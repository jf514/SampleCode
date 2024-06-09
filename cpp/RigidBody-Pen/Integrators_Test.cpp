#include "./Integrators.h"
#include "./DynamicEntities.h"
#include "./TestUtils.h"

#include <array>
#include <iostream>

//////////////////////////////////////////////////////////
// Integrators Unit Tests
//////////////////////////////////////////////////////////

int main(void)
{
    ////////////////////////////////////////////////////////////
    // Test Euler step.
    {
        ConstantVelParticle cvpEuler{ConstantVelParticle::State{0, 1.0}};
        Integrators::EulerStep(cvpEuler, 0.1);
    
        const bool testCvpEuler = TestUtils::FloatEquals(cvpEuler.m_State,ConstantVelParticle::State{0.1, 1.0}, 1.0e-6);
        TestUtils::ReportResults(testCvpEuler, "Euler Step: Constant Velocity");
    }
    
    ////////////////////////////////////////////////////////////
    // Test mid point step.
    {
        ConstantVelParticle cvpMid{ConstantVelParticle::State{0, 1.0}};
        Integrators::MidPointStep(cvpMid, 0.1);
        
        const bool testCvpMid = TestUtils::FloatEquals(cvpMid.m_State,ConstantVelParticle::State{0.1, 1.0}, 1.0e-6);
        TestUtils::ReportResults(testCvpMid, "MidPoint Step: Constant Velocity");
    }
    return 0;
}