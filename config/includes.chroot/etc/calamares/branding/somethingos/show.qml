import QtQuick 2.0;
import calamares.slideshow 1.0;

Presentation {
    id: presentation
    function nextSlide() {
        presentation.goToNextSlide();
    }
    Timer {
        id: advanceTimer
        interval: 8000
        running: true
        repeat: true
        onTriggered: nextSlide()
    }
    Slide {
        anchors.fill: parent
        Rectangle { anchors.fill: parent; color: "#0c0e12" }
        Text {
            anchors.centerIn: parent
            color: "#e8eaed"
            font.pixelSize: 28
            text: "SomethingOS\nDebian, with the lights off."
            horizontalAlignment: Text.AlignHCenter
        }
    }
    Slide {
        anchors.fill: parent
        Rectangle { anchors.fill: parent; color: "#0c0e12" }
        Text {
            anchors.centerIn: parent
            color: "#e8eaed"
            font.pixelSize: 22
            text: "GNOME Shadow is the default session.\nPlasma Shadow is one rebuild away."
            horizontalAlignment: Text.AlignHCenter
        }
    }
    Slide {
        anchors.fill: parent
        Rectangle { anchors.fill: parent; color: "#0c0e12" }
        Text {
            anchors.centerIn: parent
            color: "#3ee0c5"
            font.pixelSize: 22
            text: "Opsec level: INFINITE"
            horizontalAlignment: Text.AlignHCenter
        }
    }
}
