package app.naamjap.counter;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;

/**
 * Minimal launcher activity so the module produces a valid, installable
 * debug APK for the CI pipeline. The product itself remains the existing
 * web application in this repository; this class intentionally contains no
 * application logic and no resources are required.
 */
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView label = new TextView(this);
        label.setText("Naam Jap Counter");
        label.setTextSize(24f);
        label.setGravity(Gravity.CENTER);
        setContentView(label);
    }
}
